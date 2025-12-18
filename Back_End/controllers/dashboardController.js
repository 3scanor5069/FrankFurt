const pool = require('../config/db');

// ============================================================================
// DASHBOARD CONTROLLER - FRANK FURT
// ============================================================================
// Actualizado con filtros temporales (diario, semanal, mensual, anual)
// Base de datos: frank_furt
// Puerto: 3006
// Rutas: /api/dashboard/*
// ============================================================================

// ========================= MÉTRICAS PRINCIPALES =========================
// GET /api/dashboard/metrics?filter=diario|semanal|mensual|anual
// Retorna: { totalUsers, totalOrders, revenue, activeOrders, filter }
exports.getMetrics = async (req, res) => {
  try {
    const filter = req.query.filter || 'diario';
    let dateCondition = '';
    
    switch(filter) {
      case 'diario':
        dateCondition = 'DATE(fecha) = CURDATE()';
        break;
      case 'semanal':
        dateCondition = 'YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)';
        break;
      case 'mensual':
        dateCondition = 'MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())';
        break;
      case 'anual':
        dateCondition = 'YEAR(fecha) = YEAR(CURDATE())';
        break;
      default:
        dateCondition = 'DATE(fecha) = CURDATE()';
    }

    const [rows] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM usuario WHERE rol = 'cliente' AND activo = 1) AS totalUsers,
        (SELECT COUNT(*) FROM pedido WHERE estado = 'entregado' AND ${dateCondition}) AS totalOrders,
        (SELECT IFNULL(SUM(monto), 0) FROM pago WHERE ${dateCondition}) AS revenue,
        (SELECT COUNT(*) FROM pedido WHERE estado IN ('pendiente', 'en_preparacion')) AS activeOrders
    `);

    res.json({
      totalUsers: parseInt(rows[0].totalUsers) || 0,
      totalOrders: parseInt(rows[0].totalOrders) || 0,
      revenue: parseFloat(rows[0].revenue) || 0,
      activeOrders: parseInt(rows[0].activeOrders) || 0,
      filter: filter
    });

  } catch (error) {
    console.error('❌ Error en getMetrics:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener métricas', 
      error: error.message 
    });
  }
};

// ========================= VENTAS CON FILTROS =========================
// GET /api/dashboard/sales?filter=diario|semanal|mensual|anual
// Retorna: [{ label: 'Lun', valor: 5000 }, ...]
exports.getSales = async (req, res) => {
  try {
    const filter = req.query.filter || 'mensual';
    let sql = '';
    
    switch(filter) {
      case 'diario':
        sql = `
          SELECT 
            HOUR(fecha) AS hora,
            CONCAT(HOUR(fecha), ':00') AS label,
            IFNULL(SUM(monto), 0) AS valor
          FROM pago
          WHERE DATE(fecha) = CURDATE()
          GROUP BY HOUR(fecha)
          ORDER BY hora
        `;
        break;
        
      case 'semanal':
        sql = `
          SELECT
            CASE DAYOFWEEK(fecha)
              WHEN 1 THEN 'Dom'
              WHEN 2 THEN 'Lun'
              WHEN 3 THEN 'Mar'
              WHEN 4 THEN 'Mié'
              WHEN 5 THEN 'Jue'
              WHEN 6 THEN 'Vie'
              WHEN 7 THEN 'Sáb'
            END AS label,
            DAYOFWEEK(fecha) AS dayNum,
            IFNULL(SUM(monto), 0) AS valor
          FROM pago
          WHERE YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)
          GROUP BY DAYOFWEEK(fecha)
          ORDER BY DAYOFWEEK(fecha)
        `;
        break;
        
      case 'mensual':
        sql = `
          SELECT
            DAY(fecha) AS dia,
            CONCAT('Día ', DAY(fecha)) AS label,
            IFNULL(SUM(monto), 0) AS valor
          FROM pago
          WHERE MONTH(fecha) = MONTH(CURDATE()) 
            AND YEAR(fecha) = YEAR(CURDATE())
          GROUP BY DAY(fecha)
          ORDER BY dia
        `;
        break;
        
      case 'anual':
        sql = `
          SELECT
            CASE MONTH(fecha)
              WHEN 1 THEN 'Ene'
              WHEN 2 THEN 'Feb'
              WHEN 3 THEN 'Mar'
              WHEN 4 THEN 'Abr'
              WHEN 5 THEN 'May'
              WHEN 6 THEN 'Jun'
              WHEN 7 THEN 'Jul'
              WHEN 8 THEN 'Ago'
              WHEN 9 THEN 'Sep'
              WHEN 10 THEN 'Oct'
              WHEN 11 THEN 'Nov'
              WHEN 12 THEN 'Dic'
            END AS label,
            IFNULL(SUM(monto), 0) AS valor
          FROM pago
          WHERE YEAR(fecha) = YEAR(CURDATE())
          GROUP BY MONTH(fecha)
          ORDER BY MONTH(fecha)
        `;
        break;
    }
    
    const [result] = await pool.query(sql);
    res.json(result.map(row => ({ 
      label: row.label, 
      valor: parseFloat(row.valor) || 0 
    })));

  } catch (error) {
    console.error('❌ Error en getSales:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener ventas', 
      error: error.message 
    });
  }
};

// ========================= NUEVOS USUARIOS CON FILTROS =========================
// GET /api/dashboard/new-users?filter=diario|semanal|mensual|anual
// Retorna: [{ label: 'Sem 1', usuarios: 45 }, ...]
exports.getNewUsers = async (req, res) => {
  try {
    const filter = req.query.filter || 'mensual';
    let sql = '';
    
    switch(filter) {
      case 'diario':
        sql = `
          SELECT
            HOUR(fecha_registro) AS hora,
            CONCAT(HOUR(fecha_registro), ':00') AS label,
            COUNT(*) AS usuarios
          FROM usuario
          WHERE DATE(fecha_registro) = CURDATE()
            AND rol = 'cliente'
            AND activo = 1
          GROUP BY HOUR(fecha_registro)
          ORDER BY hora
        `;
        break;
        
      case 'semanal':
        sql = `
          SELECT
            CASE DAYOFWEEK(fecha_registro)
              WHEN 1 THEN 'Dom'
              WHEN 2 THEN 'Lun'
              WHEN 3 THEN 'Mar'
              WHEN 4 THEN 'Mié'
              WHEN 5 THEN 'Jue'
              WHEN 6 THEN 'Vie'
              WHEN 7 THEN 'Sáb'
            END AS label,
            COUNT(*) AS usuarios
          FROM usuario
          WHERE YEARWEEK(fecha_registro, 1) = YEARWEEK(CURDATE(), 1)
            AND rol = 'cliente'
            AND activo = 1
          GROUP BY DAYOFWEEK(fecha_registro)
          ORDER BY DAYOFWEEK(fecha_registro)
        `;
        break;
        
      case 'mensual':
        sql = `
          SELECT
            CONCAT('Sem ', 
              WEEK(fecha_registro, 1) - WEEK(DATE_SUB(fecha_registro, INTERVAL DAY(fecha_registro) - 1 DAY), 1) + 1
            ) AS label,
            COUNT(*) AS usuarios
          FROM usuario
          WHERE MONTH(fecha_registro) = MONTH(CURDATE())
            AND YEAR(fecha_registro) = YEAR(CURDATE())
            AND rol = 'cliente'
            AND activo = 1
          GROUP BY WEEK(fecha_registro, 1)
          ORDER BY WEEK(fecha_registro, 1)
        `;
        break;
        
      case 'anual':
        sql = `
          SELECT
            CASE MONTH(fecha_registro)
              WHEN 1 THEN 'Ene'
              WHEN 2 THEN 'Feb'
              WHEN 3 THEN 'Mar'
              WHEN 4 THEN 'Abr'
              WHEN 5 THEN 'May'
              WHEN 6 THEN 'Jun'
              WHEN 7 THEN 'Jul'
              WHEN 8 THEN 'Ago'
              WHEN 9 THEN 'Sep'
              WHEN 10 THEN 'Oct'
              WHEN 11 THEN 'Nov'
              WHEN 12 THEN 'Dic'
            END AS label,
            COUNT(*) AS usuarios
          FROM usuario
          WHERE YEAR(fecha_registro) = YEAR(CURDATE())
            AND rol = 'cliente'
            AND activo = 1
          GROUP BY MONTH(fecha_registro)
          ORDER BY MONTH(fecha_registro)
        `;
        break;
    }
    
    const [result] = await pool.query(sql);
    res.json(result.map(row => ({ 
      label: row.label, 
      usuarios: parseInt(row.usuarios) || 0 
    })));

  } catch (error) {
    console.error('❌ Error en getNewUsers:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener nuevos usuarios', 
      error: error.message 
    });
  }
};

// ========================= TOP PRODUCTOS CON FILTROS =========================
// GET /api/dashboard/top-products?filter=diario|semanal|mensual|anual
// Retorna: [{ name: 'Hamburguesa', value: 35, color: '#FF6B6B' }, ...]
exports.getTopProducts = async (req, res) => {
  try {
    const filter = req.query.filter || 'mensual';
    let dateCondition = '';
    
    switch(filter) {
      case 'diario':
        dateCondition = 'DATE(ped.fecha) = CURDATE()';
        break;
      case 'semanal':
        dateCondition = 'YEARWEEK(ped.fecha, 1) = YEARWEEK(CURDATE(), 1)';
        break;
      case 'mensual':
        dateCondition = 'MONTH(ped.fecha) = MONTH(CURDATE()) AND YEAR(ped.fecha) = YEAR(CURDATE())';
        break;
      case 'anual':
        dateCondition = 'YEAR(ped.fecha) = YEAR(CURDATE())';
        break;
      default:
        dateCondition = 'MONTH(ped.fecha) = MONTH(CURDATE()) AND YEAR(ped.fecha) = YEAR(CURDATE())';
    }
    
    const [result] = await pool.query(`
      SELECT
        p.nombre AS name,
        SUM(pp.cantidad) AS totalVendido
      FROM pedido_producto pp
      INNER JOIN producto p ON pp.idProducto = p.idProducto
      INNER JOIN pedido ped ON pp.idPedido = ped.idPedido
      WHERE ${dateCondition}
        AND ped.estado = 'entregado'
      GROUP BY p.idProducto, p.nombre
      ORDER BY totalVendido DESC
      LIMIT 5
    `);
    
    if (result.length === 0) {
      return res.json([]);
    }
    
    const totalSales = result.reduce((acc, item) => acc + parseFloat(item.totalVendido), 0);
    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    res.json(result.map((item, index) => ({
      name: item.name,
      value: totalSales > 0 ? Math.round((parseFloat(item.totalVendido) / totalSales) * 100) : 0,
      color: COLORS[index % COLORS.length]
    })));

  } catch (error) {
    console.error('❌ Error en getTopProducts:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener productos más vendidos', 
      error: error.message 
    });
  }
};

// ========================= USUARIOS SIN PEDIDOS (NUEVO) =========================
// GET /api/dashboard/users-without-orders
// Retorna: [{ id, name, email, date, status, total_pedidos }, ...]
exports.getUsersWithoutOrders = async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.idUsuario AS id,
        u.nombre AS name,
        u.correo AS email,
        DATE_FORMAT(u.fecha_registro, '%Y-%m-%d') AS date,
        CASE WHEN u.activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS status,
        COALESCE(
          (SELECT COUNT(*) FROM pedido p WHERE p.idUsuario = u.idUsuario),
          0
        ) AS total_pedidos
      FROM usuario u
      WHERE u.rol = 'cliente' 
        AND u.activo = 1
        AND NOT EXISTS (
          SELECT 1 FROM pedido p WHERE p.idUsuario = u.idUsuario
        )
      ORDER BY u.fecha_registro DESC
      LIMIT 10
    `;
    
    const [result] = await pool.query(sql);
    res.json(result);

  } catch (error) {
    console.error('❌ Error en getUsersWithoutOrders:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener usuarios sin pedidos', 
      error: error.message 
    });
  }
};

// ========================= USUARIOS RECIENTES (BACKUP) =========================
// GET /api/dashboard/recent-users
// Retorna: [{ id, name, email, date, status }, ...]
exports.getRecentUsers = async (req, res) => {
  try {
    const sql = `
      SELECT 
        idUsuario AS id,
        nombre AS name,
        correo AS email,
        DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS date,
        CASE WHEN activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS status
      FROM usuario
      WHERE rol = 'cliente'
      ORDER BY fecha_registro DESC
      LIMIT 10
    `;
    
    const [result] = await pool.query(sql);
    res.json(result);

  } catch (error) {
    console.error('❌ Error en getRecentUsers:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener usuarios recientes', 
      error: error.message 
    });
  }
};

// ========================= COMPARACIONES =========================
// GET /api/dashboard/comparisons
exports.getComparisons = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) 
         FROM usuario 
         WHERE rol = 'cliente' 
           AND MONTH(fecha_registro) = MONTH(CURDATE())
           AND YEAR(fecha_registro) = YEAR(CURDATE())
           AND activo = 1
        ) AS usersThisMonth,
        
        (SELECT COUNT(*) 
         FROM usuario 
         WHERE rol = 'cliente' 
           AND MONTH(fecha_registro) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
           AND YEAR(fecha_registro) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
           AND activo = 1
        ) AS usersLastMonth,
        
        (SELECT IFNULL(SUM(monto), 0)
         FROM pago
         WHERE DATE(fecha) = CURDATE()
        ) AS revenueToday,
        
        (SELECT IFNULL(SUM(monto), 0)
         FROM pago
         WHERE DATE(fecha) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ) AS revenueYesterday,
        
        (SELECT COUNT(*)
         FROM pedido
         WHERE YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)
           AND estado = 'entregado'
        ) AS ordersThisWeek,
        
        (SELECT COUNT(*)
         FROM pedido
         WHERE YEARWEEK(fecha, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)
           AND estado = 'entregado'
        ) AS ordersLastWeek
    `);
    
    const data = rows[0];
    
    const userChange = data.usersLastMonth > 0 
      ? Math.round(((data.usersThisMonth - data.usersLastMonth) / data.usersLastMonth) * 100)
      : 0;
      
    const revenueChange = data.revenueYesterday > 0
      ? Math.round(((data.revenueToday - data.revenueYesterday) / data.revenueYesterday) * 100)
      : 0;
      
    const orderChange = data.ordersLastWeek > 0
      ? Math.round(((data.ordersThisWeek - data.ordersLastWeek) / data.ordersLastWeek) * 100)
      : 0;
    
    res.json({
      users: {
        current: parseInt(data.usersThisMonth),
        previous: parseInt(data.usersLastMonth),
        change: userChange
      },
      revenue: {
        current: parseFloat(data.revenueToday),
        previous: parseFloat(data.revenueYesterday),
        change: revenueChange
      },
      orders: {
        current: parseInt(data.ordersThisWeek),
        previous: parseInt(data.ordersLastWeek),
        change: orderChange
      }
    });

  } catch (error) {
    console.error('❌ Error en getComparisons:', error.message);
    res.status(500).json({ 
      message: 'Error al obtener comparaciones', 
      error: error.message 
    });
  }
};

// ============================================================================
// EXPORTAR CONTROLADOR
// ============================================================================

console.log('✅ DashboardController ACTUALIZADO cargado correctamente');
console.log('📊 Endpoints disponibles:');
console.log('   - GET /api/dashboard/metrics?filter=diario|semanal|mensual|anual');
console.log('   - GET /api/dashboard/sales?filter=diario|semanal|mensual|anual');
console.log('   - GET /api/dashboard/new-users?filter=diario|semanal|mensual|anual');
console.log('   - GET /api/dashboard/top-products?filter=diario|semanal|mensual|anual');
console.log('   - GET /api/dashboard/users-without-orders (NUEVO)');
console.log('   - GET /api/dashboard/recent-users');
console.log('   - GET /api/dashboard/comparisons');

module.exports = exports;
