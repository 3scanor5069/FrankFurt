// backend/controllers/orderController.js
const db = require('../config/db');

// ============================================================================
// 1. OBTENER TABLERO DE PEDIDOS (GET /api/pedidos/status-board)
// ============================================================================
// Retorna todos los pedidos activos agrupados por estado
const getStatusBoard = async (req, res) => {
  try {
    // Consultar todos los pedidos activos con sus detalles
    const [pedidos] = await db.query(
      `SELECT 
        p.idPedido,
        p.idUsuario,
        p.idMesa,
        p.fecha,
        p.estado,
        p.total,
        p.observaciones,
        m.numero as mesa_numero,
        m.estado as mesa_estado,
        u.nombre as usuario_nombre,
        u.correo as usuario_correo
      FROM pedido p
      LEFT JOIN mesa m ON p.idMesa = m.idMesa
      LEFT JOIN usuario u ON p.idUsuario = u.idUsuario
      WHERE p.estado IN ('pendiente', 'en_preparacion', 'entregado', 'pagado')
      ORDER BY 
        CASE p.estado
          WHEN 'pendiente' THEN 1
          WHEN 'en_preparacion' THEN 2
          WHEN 'entregado' THEN 3
          WHEN 'pagado' THEN 4
        END,
        p.fecha DESC`
    );

    // Para cada pedido, obtener sus productos
    for (let pedido of pedidos) {
      const [productos] = await db.query(
        `SELECT 
          pp.cantidad,
          pp.precio_unitario,
          pp.subtotal,
          pr.idProducto,
          pr.nombre,
          pr.precio
        FROM pedido_producto pp
        INNER JOIN producto pr ON pp.idProducto = pr.idProducto
        WHERE pp.idPedido = ?`,
        [pedido.idPedido]
      );

      pedido.productos = productos;

      // Agregar información de mesa si existe
      if (pedido.idMesa) {
        pedido.mesa = {
          numero: pedido.mesa_numero,
          estado: pedido.mesa_estado
        };
      }

      // Agregar información de usuario si existe
      if (pedido.idUsuario) {
        pedido.usuario = {
          nombre: pedido.usuario_nombre,
          correo: pedido.usuario_correo
        };
      }

      // Limpiar campos temporales
      delete pedido.mesa_numero;
      delete pedido.mesa_estado;
      delete pedido.usuario_nombre;
      delete pedido.usuario_correo;
    }

    // Agrupar pedidos por estado
    const groupedOrders = {
      pendiente: pedidos.filter(p => p.estado === 'pendiente'),
      en_preparacion: pedidos.filter(p => p.estado === 'en_preparacion'),
      entregado: pedidos.filter(p => p.estado === 'entregado'),
      pagado: pedidos.filter(p => p.estado === 'pagado')
    };

    res.status(200).json(groupedOrders);

  } catch (error) {
    console.error('❌ Error al obtener tablero de pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el tablero de pedidos',
      error: error.message
    });
  }
};

// ============================================================================
// 2. OBTENER MESAS DISPONIBLES (GET /api/mesas/available)
// ============================================================================
const getAvailableMesas = async (req, res) => {
  try {
    const [mesas] = await db.query(
      `SELECT 
        idMesa,
        numero,
        idSede,
        estado
      FROM mesa
      WHERE estado = 'disponible'
      ORDER BY numero ASC`
    );

    res.status(200).json({
      success: true,
      mesas: mesas
    });

  } catch (error) {
    console.error('❌ Error al obtener mesas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las mesas disponibles',
      error: error.message
    });
  }
};

// ============================================================================
// 3. OBTENER PRODUCTOS DEL MENÚ (GET /api/menu/products)
// ============================================================================
// ✅ CORREGIDO: Ahora consulta el stock desde la tabla inventario
const getMenuProducts = async (req, res) => {
  try {
    const [productos] = await db.query(
      `SELECT 
        p.idProducto,
        p.nombre,
        p.descripcion,
        p.precio,
        p.idCategoria,
        p.disponible,
        COALESCE(i.stockDisponible, 0) as stock,
        i.stock_minimo,
        i.stock_maximo
      FROM producto p
      LEFT JOIN inventario i ON p.idProducto = i.idProducto AND i.idSede = 1
      WHERE p.disponible = 1
      ORDER BY p.nombre ASC`
    );

    res.status(200).json({
      success: true,
      productos: productos
    });

  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos del menú',
      error: error.message
    });
  }
};

// ============================================================================
// 4. OBTENER CLIENTES (GET /api/users/clientes)
// ============================================================================
const getClientes = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      `SELECT 
        idUsuario,
        nombre,
        correo,
        telefono
      FROM usuario
      WHERE rol = 'cliente'
      ORDER BY nombre ASC`
    );

    res.status(200).json({
      success: true,
      usuarios: usuarios
    });

  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de clientes',
      error: error.message
    });
  }
};

// ============================================================================
// 5. CREAR PEDIDO MANUAL (POST /api/pedidos/manual-create)
// ============================================================================
// ✅ CORREGIDO: Descuenta stock correctamente de inventario
const createManualOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { idMesa, idUsuario, productos, observaciones } = req.body;

    console.log('📝 Creando pedido manual:', { idMesa, idUsuario, productosCount: productos.length });

    // Validaciones
    if (!idMesa && !idUsuario) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe especificar una mesa o un usuario'
      });
    }

    if (!productos || productos.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe agregar al menos un producto'
      });
    }

    // Calcular total del pedido
    const total = productos.reduce((sum, p) => sum + p.subtotal, 0);

    // Obtener ID de sede
    let idSede = 1; // Valor por defecto

    if (idMesa) {
      const [mesa] = await connection.query(
        'SELECT idSede FROM mesa WHERE idMesa = ?',
        [idMesa]
      );

      if (mesa.length > 0) {
        idSede = mesa[0].idSede;
      }
    }

    console.log('💰 Total calculado:', total);
    console.log('🏢 ID Sede:', idSede);

    // Insertar el pedido
    const [resultPedido] = await connection.query(
      `INSERT INTO pedido (idUsuario, idMesa, fecha, estado, total, idSede, observaciones)
       VALUES (?, ?, NOW(), 'pendiente', ?, ?, ?)`,
      [idUsuario || null, idMesa || null, total, idSede, observaciones || null]
    );

    const idPedido = resultPedido.insertId;
    console.log('✅ Pedido creado con ID:', idPedido);

    // Insertar los productos del pedido Y descontar stock
    for (const producto of productos) {
      // Calcular el precio unitario
      const precioUnitario = producto.precio || (producto.subtotal / producto.cantidad);
      
      console.log(`📦 Insertando producto ${producto.idProducto}: ${producto.cantidad} unidades`);
      
      // Insertar en pedido_producto
      await connection.query(
        `INSERT INTO pedido_producto (idPedido, idProducto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [idPedido, producto.idProducto, producto.cantidad, precioUnitario]
      );

      // ✅ CORREGIDO: Descontar stock de la tabla inventario
      console.log(`🔄 Descontando ${producto.cantidad} unidades del inventario`);
      
      const [resultUpdate] = await connection.query(
        `UPDATE inventario 
         SET stockDisponible = stockDisponible - ?
         WHERE idProducto = ? AND idSede = ?`,
        [producto.cantidad, producto.idProducto, idSede]
      );

      // Verificar si se actualizó el inventario
      if (resultUpdate.affectedRows === 0) {
        console.warn(`⚠️ No se encontró inventario para producto ${producto.idProducto} en sede ${idSede}`);
        
        // Crear registro de inventario si no existe
        await connection.query(
          `INSERT INTO inventario (idInsumo, idSede, stockDisponible, stock_minimo, stock_maximo, idProducto)
           VALUES (1, ?, ?, 5, 100, ?)
           ON DUPLICATE KEY UPDATE stockDisponible = stockDisponible - ?`,
          [idSede, Math.max(0, 100 - producto.cantidad), producto.idProducto, producto.cantidad]
        );
        
        console.log(`✅ Inventario creado/actualizado para producto ${producto.idProducto}`);
      } else {
        console.log(`✅ Stock descontado correctamente para producto ${producto.idProducto}`);
      }

      // Verificar que no quedó en negativo
      const [inventarioCheck] = await connection.query(
        `SELECT stockDisponible FROM inventario WHERE idProducto = ? AND idSede = ?`,
        [producto.idProducto, idSede]
      );

      if (inventarioCheck.length > 0 && inventarioCheck[0].stockDisponible < 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para el producto ${producto.nombre || producto.idProducto}`
        });
      }
    }

    await connection.commit();
    console.log('🎉 Pedido creado exitosamente');

    res.status(201).json({
      success: true,
      message: 'Pedido creado correctamente',
      idPedido: idPedido,
      total: total
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al crear pedido manual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el pedido',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// 6. ACTUALIZAR ESTADO DEL PEDIDO (PUT /api/pedidos/:idPedido/update-status)
// ============================================================================
const updateOrderStatus = async (req, res) => {
  try {
    const { idPedido } = req.params;
    const { newStatus } = req.body;

    console.log(`🔄 Actualizando pedido ${idPedido} a estado: ${newStatus}`);

    // Validar que el estado sea válido
    const validStatuses = ['pendiente', 'en_preparacion', 'entregado', 'pagado'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    // Verificar que el pedido existe
    const [pedido] = await db.query(
      'SELECT estado FROM pedido WHERE idPedido = ?',
      [idPedido]
    );

    if (pedido.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Actualizar el estado
    await db.query(
      'UPDATE pedido SET estado = ? WHERE idPedido = ?',
      [newStatus, idPedido]
    );

    console.log(`✅ Pedido ${idPedido} actualizado a ${newStatus}`);

    res.status(200).json({
      success: true,
      message: 'Estado actualizado correctamente',
      newStatus: newStatus
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del pedido',
      error: error.message
    });
  }
};

// ============================================================================
// 7. PROCESAR PAGO / CERRAR PEDIDO (POST /api/pedidos/:idPedido/pay)
// ============================================================================
const processPayment = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { idPedido } = req.params;
    const { montoTotal } = req.body;

    console.log(`💳 Procesando pago para pedido ${idPedido}: $${montoTotal}`);

    // Validaciones
    if (!montoTotal || montoTotal <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Monto inválido'
      });
    }

    // Verificar que el pedido existe y está en estado 'entregado'
    const [pedido] = await connection.query(
      'SELECT estado, total FROM pedido WHERE idPedido = ?',
      [idPedido]
    );

    if (pedido.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    if (pedido[0].estado !== 'entregado') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El pedido debe estar en estado ENTREGADO para ser cobrado'
      });
    }

    // Verificar que el monto coincide con el total del pedido
    if (Math.abs(pedido[0].total - montoTotal) > 0.01) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El monto no coincide con el total del pedido',
        totalEsperado: pedido[0].total,
        montoRecibido: montoTotal
      });
    }

    // Insertar el registro de pago
    await connection.query(
      `INSERT INTO pago (idPago, idPedido, metodo, monto, fecha)
       VALUES (?, ?, 'efectivo', ?, NOW())`,
      [idPedido, idPedido, montoTotal]
    );

    // Actualizar el estado del pedido a 'pagado'
    await connection.query(
      'UPDATE pedido SET estado = ? WHERE idPedido = ?',
      ['pagado', idPedido]
    );

    await connection.commit();
    console.log(`✅ Pago procesado exitosamente para pedido ${idPedido}`);

    res.status(200).json({
      success: true,
      message: 'Pago procesado correctamente',
      monto: montoTotal
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al procesar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// EXPORTAR FUNCIONES
// ============================================================================
module.exports = {
  getStatusBoard,
  getAvailableMesas,
  getMenuProducts,
  getClientes,
  createManualOrder,
  updateOrderStatus,
  processPayment
};