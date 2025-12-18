// controllers/reportsController.js
const db = require('../config/db');

// ========================================
// REPORTE DE VENTAS
// ========================================
const getSalesReport = async (req, res) => {
  try {
    // Total de ventas (incluye ENTREGADO y PAGADO)
    const [totalVentas] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as totalVentas
      FROM pedido
      WHERE estado IN ('entregado', 'pagado')
    `);

    // Ventas de hoy
    const [ventasHoy] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as ventasHoy
      FROM pedido
      WHERE DATE(fecha) = CURDATE() 
        AND estado IN ('entregado', 'pagado')
    `);

    // Ventas de esta semana
    const [ventasSemana] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as ventasSemana
      FROM pedido
      WHERE YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1) 
        AND estado IN ('entregado', 'pagado')
    `);

    // Ventas de este mes
    const [ventasMes] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as ventasMes
      FROM pedido
      WHERE YEAR(fecha) = YEAR(CURDATE()) 
        AND MONTH(fecha) = MONTH(CURDATE())
        AND estado IN ('entregado', 'pagado')
    `);

    // Pedidos por estado
    const [pedidosPorEstado] = await db.query(`
      SELECT 
        estado,
        COUNT(*) as cantidad
      FROM pedido
      WHERE estado IN ('pendiente', 'en_preparacion', 'entregado', 'pagado')
      GROUP BY estado
    `);

    const pedidosEstado = {
      pendiente: 0,
      en_preparacion: 0,
      entregado: 0,
      pagado: 0
    };

    pedidosPorEstado.forEach(item => {
      pedidosEstado[item.estado] = item.cantidad;
    });

    // Ventas por día (últimos 30 días)
    const [ventasPorDia] = await db.query(`
      SELECT 
        DATE(fecha) as fecha,
        COUNT(*) as pedidos,
        COALESCE(SUM(total), 0) as total
      FROM pedido
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND estado IN ('entregado', 'pagado')
      GROUP BY DATE(fecha)
      ORDER BY fecha DESC
    `);

    res.status(200).json({
      totalVentas: totalVentas[0].totalVentas,
      ventasHoy: ventasHoy[0].ventasHoy,
      ventasSemana: ventasSemana[0].ventasSemana,
      ventasMes: ventasMes[0].ventasMes,
      pedidosPorEstado: pedidosEstado,
      ventasPorDia: ventasPorDia
    });

  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de ventas'
    });
  }
};

// ========================================
// REPORTE DE PRODUCTOS
// ========================================
const getProductsReport = async (req, res) => {
  try {
    // Productos más vendidos
    const [masVendidos] = await db.query(`
      SELECT 
        pr.idProducto,
        pr.nombre,
        SUM(pp.cantidad) as cantidad_vendida,
        SUM(pp.subtotal) as total_ventas
      FROM pedido_producto pp
      INNER JOIN producto pr ON pp.idProducto = pr.idProducto
      INNER JOIN pedido p ON pp.idPedido = p.idPedido
      WHERE p.estado IN ('entregado', 'pagado')
      GROUP BY pr.idProducto, pr.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `);

    // Productos menos vendidos (con al menos 1 venta)
    const [menosVendidos] = await db.query(`
      SELECT 
        pr.idProducto,
        pr.nombre,
        SUM(pp.cantidad) as cantidad_vendida,
        SUM(pp.subtotal) as total_ventas
      FROM pedido_producto pp
      INNER JOIN producto pr ON pp.idProducto = pr.idProducto
      INNER JOIN pedido p ON pp.idPedido = p.idPedido
      WHERE p.estado IN ('entregado', 'pagado')
      GROUP BY pr.idProducto, pr.nombre
      ORDER BY cantidad_vendida ASC
      LIMIT 10
    `);

    // Productos sin ventas
    const [sinVentas] = await db.query(`
      SELECT 
        pr.idProducto,
        pr.nombre,
        pr.precio
      FROM producto pr
      LEFT JOIN pedido_producto pp ON pr.idProducto = pp.idProducto
      WHERE pp.idProducto IS NULL AND pr.disponible = 1
      ORDER BY pr.nombre
    `);

    res.status(200).json({
      masVendidos: masVendidos,
      menosVendidos: menosVendidos,
      sinVentas: sinVentas
    });

  } catch (error) {
    console.error('Error al generar reporte de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de productos'
    });
  }
};

// ========================================
// REPORTE DE CLIENTES FRECUENTES
// Política: Un cliente es frecuente si ha realizado 5 o más compras en un mes
// ========================================
const getFrequentClientsReport = async (req, res) => {
  try {
    // Query que identifica clientes frecuentes: 
    // aquellos que han hecho 8 o más compras en algún mes (ajustado de 8 a 5)
    const [clientes] = await db.query(`
      SELECT 
        u.idUsuario,
        u.nombre,
        u.correo,
        u.telefono,
        COUNT(p.idPedido) as total_pedidos,
        COALESCE(SUM(p.total), 0) as total_gastado,
        MAX(p.fecha) as ultima_compra,
        DATE_FORMAT(p.fecha, '%Y-%m') as mes,
        COUNT(DISTINCT DATE_FORMAT(p.fecha, '%Y-%m')) as meses_activos
      FROM usuario u
      INNER JOIN pedido p ON u.idUsuario = p.idUsuario
      WHERE u.rol = 'cliente' 
        AND u.activo = 1
        AND p.estado IN ('entregado', 'pagado')
      GROUP BY 
        u.idUsuario, 
        u.nombre, 
        u.correo, 
        u.telefono,
        DATE_FORMAT(p.fecha, '%Y-%m')
      HAVING total_pedidos >= 8
      ORDER BY total_pedidos DESC, total_gastado DESC
      LIMIT 50
    `);

    // Agrupar por usuario para mostrar el resumen consolidado
    const clientesMap = new Map();
    
    clientes.forEach(cliente => {
      if (!clientesMap.has(cliente.idUsuario)) {
        clientesMap.set(cliente.idUsuario, {
          idUsuario: cliente.idUsuario,
          nombre: cliente.nombre,
          correo: cliente.correo,
          telefono: cliente.telefono,
          total_pedidos: 0,
          total_gastado: 0,
          ultima_compra: cliente.ultima_compra,
          meses_frecuente: []
        });
      }
      
      const clienteData = clientesMap.get(cliente.idUsuario);
      clienteData.total_pedidos += cliente.total_pedidos;
      clienteData.total_gastado += parseFloat(cliente.total_gastado);
      clienteData.meses_frecuente.push({
        mes: cliente.mes,
        pedidos: cliente.total_pedidos
      });
      
      // Actualizar última compra si es más reciente
      if (new Date(cliente.ultima_compra) > new Date(clienteData.ultima_compra)) {
        clienteData.ultima_compra = cliente.ultima_compra;
      }
    });

    // Convertir el Map a array y ordenar
    const clientesFrequentesArray = Array.from(clientesMap.values())
      .map(cliente => ({
        idUsuario: cliente.idUsuario,
        nombre: cliente.nombre,
        correo: cliente.correo,
        telefono: cliente.telefono,
        total_pedidos: cliente.total_pedidos,
        total_gastado: cliente.total_gastado,
        ultima_compra: cliente.ultima_compra,
        meses_frecuente_count: cliente.meses_frecuente.length
      }))
      .sort((a, b) => {
        // Ordenar primero por número de meses frecuente, luego por total de pedidos
        if (b.meses_frecuente_count !== a.meses_frecuente_count) {
          return b.meses_frecuente_count - a.meses_frecuente_count;
        }
        return b.total_pedidos - a.total_pedidos;
      })
      .slice(0, 20); // Limitar a top 20

    res.status(200).json(clientesFrequentesArray);

  } catch (error) {
    console.error('Error al generar reporte de clientes frecuentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de clientes frecuentes'
    });
  }
};

module.exports = {
  getSalesReport,
  getProductsReport,
  getFrequentClientsReport
};