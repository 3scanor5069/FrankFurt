// controllers/ventaController.js
const pool = require('../config/db'); // Cambiado a pool

const ventaController = {
  // Registrar venta manual
  registrarVentaManual: async (req, res) => {
    let connection;

    try {
      connection = await pool.getConnection(); // Obtener una conexión del pool
      await connection.beginTransaction();

      const { idMesa, productos } = req.body;

      // Validaciones básicas
      if (!idMesa || !productos || productos.length === 0) {
        return res.status(400).json({
          error: 'Se requiere ID de mesa y al menos un producto'
        });
      }

      // Validar que la mesa existe
      const [mesa] = await connection.execute(
        'SELECT id FROM mesa WHERE id = ?',
        [idMesa]
      );

      if (mesa.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          error: 'La mesa seleccionada no existe'
        });
      }

      // Validar productos y calcular total
      let totalPedido = 0;
      const productosValidados = [];

      for (const producto of productos) {
        const { idProducto, cantidad } = producto;

        if (!idProducto || !cantidad || cantidad <= 0) {
          await connection.rollback();
          return res.status(400).json({
            error: 'Todos los productos deben tener ID y cantidad válidos'
          });
        }

        // Obtener información del producto
        const [productoInfo] = await connection.execute(
          'SELECT idProducto, nombre, precio FROM producto WHERE idProducto = ?',
          [idProducto]
        );

        if (productoInfo.length === 0) {
          await connection.rollback();
          return res.status(400).json({
            error: `El producto con ID ${idProducto} no existe`
          });
        }

        // Verificar stock disponible
        const [stockInfo] = await connection.execute(
          'SELECT stockDisponible FROM inventario WHERE idProducto = ?',
          [idProducto]
        );

        if (stockInfo.length === 0 || stockInfo[0].stockDisponible < cantidad) {
          await connection.rollback();
          return res.status(400).json({
            error: `Stock insuficiente para el producto ${productoInfo[0].nombre}`
          });
        }

        const subtotal = productoInfo[0].precio * cantidad;
        totalPedido += subtotal;

        productosValidados.push({
          idProducto,
          cantidad,
          precio: productoInfo[0].precio,
          subtotal,
          nombre: productoInfo[0].nombre
        });
      }

      // Crear el pedido
      const fechaActual = new Date();
      const [resultPedido] = await connection.execute(
        'INSERT INTO pedido (idMesa, fecha, total, estado) VALUES (?, ?, ?, ?)',
        [idMesa, fechaActual, totalPedido, 'en preparación']
      );

      const idPedido = resultPedido.insertId;

      // Insertar productos del pedido y actualizar inventario
      for (const producto of productosValidados) {
        // Insertar en pedido_producto
        await connection.execute(
          'INSERT INTO pedido_producto (idPedido, idProducto, cantidad, precioUnitario) VALUES (?, ?, ?, ?)',
          [idPedido, producto.idProducto, producto.cantidad, producto.precio]
        );

        // Actualizar inventario
        await connection.execute(
          'UPDATE inventario SET stockDisponible = stockDisponible - ? WHERE idProducto = ?',
          [producto.cantidad, producto.idProducto]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Pedido registrado exitosamente',
        data: {
          idPedido,
          idMesa,
          total: totalPedido,
          fecha: fechaActual,
          productos: productosValidados,
          estado: 'en preparación'
        }
      });

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error al registrar venta manual:', error);
      res.status(500).json({
        error: 'Error interno del servidor al procesar el pedido',
        details: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  },

  // Obtener todas las ventas (método adicional para futuras funcionalidades)
  obtenerVentas: async (req, res) => {
    try {
    const [result] = await pool.query(sql);
    const menuItems = result.map(item => ({
        idProducto: item.idProducto, // Cambiado de 'id' a 'idProducto'
        name: item.nombreProducto,
        description: item.descripcionProducto,
        price: item.precio,
        status: item.activo === 1 ? 'Activo' : 'Inactivo',
        category: item.categoria,
        image: item.imagen || null
    }));
    res.json(menuItems);
} catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({
        error: 'Error al obtener las ventas',
        details: error.message
      });
    }
  },

  // Obtener venta por ID (método adicional para futuras funcionalidades)
  obtenerVentaPorId: async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener información del pedido
      const [pedido] = await pool.execute(`
        SELECT 
          p.idPedido,
          p.idMesa,
          p.fecha,
          p.total,
          p.estado,
          m.numero as numeroMesa
        FROM pedido p
        LEFT JOIN mesa m ON p.idMesa = m.id
        WHERE p.idPedido = ?
      `, [id]);

      if (pedido.length === 0) {
        return res.status(404).json({
          error: 'Pedido no encontrado'
        });
      }

      // Obtener productos del pedido
      const [productos] = await pool.execute(`
        SELECT 
          pp.idProducto,
          pp.cantidad,
          pp.precioUnitario,
          pr.nombre
        FROM pedido_producto pp
        JOIN producto pr ON pp.idProducto = pr.idProducto
        WHERE pp.idPedido = ?
      `, [id]);

      res.json({
        success: true,
        data: {
          ...pedido[0],
          productos
        }
      });
    } catch (error) {
      console.error('Error al obtener venta por ID:', error);
      res.status(500).json({
        error: 'Error al obtener la venta',
        details: error.message
      });
    }
  }
};

module.exports = ventaController;