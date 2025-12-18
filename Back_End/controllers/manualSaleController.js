// ========================================
// 🍔 MANUAL SALE CONTROLLER - DEFINITIVO
// Frank Furt TPV System
// ========================================
// Versión final optimizada con personalización completa
// Patrón: Igual que UsersCrud, MenuCrud, InventoryCrud
// ========================================

const db = require('../config/db');

/**
 * Obtiene todas las mesas con su estado actual
 * @route GET /api/manualSale/mesas
 */
const getMesas = async (req, res) => {
  try {
    const query = `
      SELECT 
        idMesa, 
        numero, 
        estado,
        idSede,
        capacidad
      FROM mesa 
      WHERE idSede = 1
      ORDER BY 
        CASE estado
          WHEN 'disponible' THEN 1
          WHEN 'ocupada' THEN 2
          WHEN 'limpieza' THEN 3
        END,
        numero
    `;
    const [mesas] = await db.query(query);
    
    res.json({
      success: true,
      data: mesas,
      total: mesas.length,
      disponibles: mesas.filter(m => m.estado === 'disponible').length
    });
  } catch (error) {
    console.error('❌ Error getMesas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al cargar las mesas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene todos los productos disponibles con información de stock
 * @route GET /api/manualSale/productos
 */
const getProductos = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.idProducto,
        p.nombre,
        p.precio,
        p.descripcion,
        p.disponible,
        c.nombre as categoria,
        c.id as idCategoria,
        COALESCE(i.stockDisponible, 0) as stock,
        p.imagen_url
      FROM producto p
      INNER JOIN categoria c ON p.idCategoria = c.id
      LEFT JOIN inventario i ON p.idProducto = i.idProducto AND i.idSede = 1
      WHERE p.disponible = 1 AND c.activo = 1
      ORDER BY c.nombre, p.nombre
    `;
    const [productos] = await db.query(query);
    
    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('❌ Error getProductos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al cargar los productos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🆕 Obtiene todas las opciones de personalización disponibles AGRUPADAS
 * @route GET /api/manualSale/personalizaciones
 */
const getPersonalizaciones = async (req, res) => {
  try {
    const query = `
      SELECT 
        idPersonalizacion,
        nombre,
        descripcion,
        tipo,
        costoExtra,
        activo,
        categoria
      FROM personalizacionproducto
      WHERE activo = 1
      ORDER BY categoria, nombre
    `;
    const [personalizaciones] = await db.query(query);
    
    // Agrupar por categoría para mejor UX en el frontend
    const agrupadas = personalizaciones.reduce((acc, p) => {
      const cat = p.categoria || 'Otras';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: personalizaciones,
      agrupadas,
      total: personalizaciones.length
    });
  } catch (error) {
    console.error('❌ Error getPersonalizaciones:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al cargar las personalizaciones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene todas las categorías activas con cantidad de productos
 * @route GET /api/manualSale/categorias
 */
const getCategorias = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.descripcion,
        COUNT(p.idProducto) as cantidadProductos
      FROM categoria c
      LEFT JOIN producto p ON c.id = p.idCategoria AND p.disponible = 1
      WHERE c.activo = 1 
      GROUP BY c.id, c.nombre, c.descripcion
      HAVING cantidadProductos > 0
      ORDER BY c.nombre
    `;
    const [categorias] = await db.query(query);
    
    res.json({
      success: true,
      data: categorias,
      total: categorias.length
    });
  } catch (error) {
    console.error('❌ Error getCategorias:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al cargar las categorías',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🔥 Registra una nueva venta en mesa CON PERSONALIZACIÓN COMPLETA
 * @route POST /api/manualSale/registrar
 * @body { 
 *   idMesa, 
 *   idSede, 
 *   idUsuario,
 *   productos: [{ 
 *     idProducto, 
 *     cantidad,
 *     personalizaciones: [idPersonalizacion],
 *     notas: "string opcional"
 *   }],
 *   observaciones: "observaciones generales del pedido"
 * }
 */
const registrarVenta = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { idMesa, idSede = 1, idUsuario = 1, productos, observaciones = null } = req.body;

    // ==========================================
    // 1️⃣ VALIDACIONES DE ENTRADA
    // ==========================================
    if (!idMesa) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'Debe seleccionar una mesa',
        code: 'MESA_REQUIRED'
      });
    }

    if (!productos || productos.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'El carrito está vacío',
        code: 'CART_EMPTY'
      });
    }

    // Validar formato de productos
    const productosValidos = productos.every(p => 
      p.idProducto && 
      p.cantidad && 
      Number.isInteger(p.cantidad) && 
      p.cantidad > 0
    );

    if (!productosValidos) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'Formato de productos inválido',
        code: 'INVALID_PRODUCTS'
      });
    }

    // ==========================================
    // 2️⃣ VERIFICAR DISPONIBILIDAD DE MESA
    // ==========================================
    const [mesas] = await connection.query(
      'SELECT idMesa, numero, estado FROM mesa WHERE idMesa = ?',
      [idMesa]
    );

    if (mesas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Mesa no encontrada',
        code: 'MESA_NOT_FOUND'
      });
    }

    if (mesas[0].estado !== 'disponible') {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        error: `La mesa ${mesas[0].numero} no está disponible`,
        code: 'MESA_NO_DISPONIBLE'
      });
    }

    // ==========================================
    // 3️⃣ VERIFICAR STOCK DISPONIBLE
    // ==========================================
    const productosIds = productos.map(p => p.idProducto);
    const [stockData] = await connection.query(`
      SELECT 
        i.idProducto,
        p.nombre,
        p.precio,
        i.stockDisponible
      FROM inventario i
      INNER JOIN producto p ON i.idProducto = p.idProducto
      WHERE i.idSede = ? AND i.idProducto IN (?)
    `, [idSede, productosIds]);

    // Validar stock para cada producto
    for (const producto of productos) {
      const stock = stockData.find(s => s.idProducto === producto.idProducto);
      
      if (!stock) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: `Producto con ID ${producto.idProducto} no encontrado en inventario`,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      if (stock.stockDisponible < producto.cantidad) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para ${stock.nombre}`,
          code: 'INSUFFICIENT_STOCK',
          producto: stock.nombre,
          disponible: stock.stockDisponible,
          solicitado: producto.cantidad
        });
      }
    }

    // ==========================================
    // 4️⃣ CALCULAR TOTAL DEL PEDIDO
    // ==========================================
    let totalPedido = 0;
    
    for (const producto of productos) {
      const stock = stockData.find(s => s.idProducto === producto.idProducto);
      let subtotal = stock.precio * producto.cantidad;
      
      // Agregar costo de personalizaciones si existen
      if (producto.personalizaciones && producto.personalizaciones.length > 0) {
        const [personalizacionesData] = await connection.query(`
          SELECT idPersonalizacion, costoExtra
          FROM personalizacionproducto
          WHERE idPersonalizacion IN (?) AND activo = 1
        `, [producto.personalizaciones]);
        
        const costoPersonalizaciones = personalizacionesData.reduce(
          (sum, p) => sum + (parseFloat(p.costoExtra) || 0),
          0
        ) * producto.cantidad;
        
        subtotal += costoPersonalizaciones;
      }
      
      totalPedido += subtotal;
    }

    // ==========================================
    // 5️⃣ CREAR PEDIDO PRINCIPAL
    // ==========================================
    const [pedidoResult] = await connection.query(`
      INSERT INTO pedido (
        idMesa, 
        idSede, 
        idUsuario, 
        fecha, 
        estado, 
        total, 
        tipo_pedido,
        observaciones
      ) VALUES (?, ?, ?, NOW(), 'pendiente', ?, 'mesa', ?)
    `, [idMesa, idSede, idUsuario, totalPedido, observaciones]);

    const idPedido = pedidoResult.insertId;

    // ==========================================
    // 6️⃣ INSERTAR PRODUCTOS Y PERSONALIZACIONES
    // ==========================================
    for (const producto of productos) {
      const stock = stockData.find(s => s.idProducto === producto.idProducto);
      const precioUnitario = stock.precio;
      
      // Calcular subtotal con personalizaciones
      let subtotalProducto = precioUnitario * producto.cantidad;
      
      if (producto.personalizaciones && producto.personalizaciones.length > 0) {
        const [personalizacionesData] = await connection.query(`
          SELECT costoExtra
          FROM personalizacionproducto
          WHERE idPersonalizacion IN (?)
        `, [producto.personalizaciones]);
        
        const costoPersonalizaciones = personalizacionesData.reduce(
          (sum, p) => sum + (parseFloat(p.costoExtra) || 0),
          0
        ) * producto.cantidad;
        
        subtotalProducto += costoPersonalizaciones;
      }
      
      // Insertar en pedido_producto (sin subtotal, es campo generado)
      await connection.query(`
        INSERT INTO pedido_producto (
          idPedido,
          idProducto,
          cantidad,
          precio_unitario
        ) VALUES (?, ?, ?, ?)
      `, [
        idPedido,
        producto.idProducto,
        producto.cantidad,
        precioUnitario
      ]);
      
      // CORRECCIÓN CRÍTICA: Insertar personalizaciones usando idPedido e idProducto
      // según la estructura de la tabla pedido_personalizacion en tu BD
      if (producto.personalizaciones && producto.personalizaciones.length > 0) {
        for (const idPersonalizacion of producto.personalizaciones) {
          await connection.query(`
            INSERT INTO pedido_personalizacion (
              idPedido,
              idProducto,
              idPersonalizacion
            ) VALUES (?, ?, ?)
          `, [idPedido, producto.idProducto, idPersonalizacion]);
        }
      }
      
      // Descontar del inventario
      await connection.query(`
        UPDATE inventario 
        SET stockDisponible = stockDisponible - ?
        WHERE idProducto = ? AND idSede = ?
      `, [producto.cantidad, producto.idProducto, idSede]);
    }

    // ==========================================
    // 7️⃣ ACTUALIZAR ESTADO DE LA MESA
    // ==========================================
    await connection.query(
      "UPDATE mesa SET estado = 'ocupada' WHERE idMesa = ?",
      [idMesa]
    );

    // ==========================================
    // 8️⃣ COMMIT Y RESPUESTA EXITOSA
    // ==========================================
    await connection.commit();

    res.status(201).json({
      success: true,
      message: '✅ Pedido registrado exitosamente',
      data: {
        idPedido,
        total: totalPedido,
        idMesa,
        numeroMesa: mesas[0].numero,
        cantidadProductos: productos.length,
        cantidadItems: productos.reduce((sum, p) => sum + p.cantidad, 0),
        fecha: new Date().toISOString()
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error registrarVenta:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Error al registrar el pedido',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'SERVER_ERROR'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Obtiene estadísticas del día actual
 * @route GET /api/manualSale/estadisticas
 */
const getEstadisticas = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT p.idPedido) as totalPedidosHoy,
        COALESCE(SUM(p.total), 0) as ventasTotalesHoy,
        COUNT(DISTINCT CASE WHEN p.estado IN ('pendiente', 'en preparación') THEN p.idPedido END) as pedidosActivos,
        COUNT(DISTINCT CASE WHEN p.estado = 'entregado' THEN p.idPedido END) as pedidosCompletados,
        (SELECT COUNT(*) FROM mesa WHERE estado = 'disponible' AND idSede = 1) as mesasDisponibles,
        (SELECT COUNT(*) FROM mesa WHERE estado = 'ocupada' AND idSede = 1) as mesasOcupadas
      FROM pedido p
      WHERE DATE(p.fecha) = CURDATE()
        AND p.tipo_pedido = 'mesa'
        AND p.idSede = 1
    `;
    
    const [stats] = await db.query(query);
    
    res.json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    console.error('❌ Error getEstadisticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al cargar estadísticas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getMesas,
  getProductos,
  getPersonalizaciones,
  getCategorias,
  registrarVenta,
  getEstadisticas
};