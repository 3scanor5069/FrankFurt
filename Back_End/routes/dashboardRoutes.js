const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// ============================================================================
// DASHBOARD ROUTES - FRANK FURT
// ============================================================================
// Base URL: /api/dashboard
// Puerto: 3006
// Ejemplo completo: http://localhost:3006/api/dashboard/metrics?filter=diario
// ============================================================================

// ========================= RUTAS PRINCIPALES =========================

// GET /api/dashboard/metrics?filter=diario|semanal|mensual|anual
// Retorna métricas principales del dashboard con filtro temporal
// Response: { totalUsers, totalOrders, revenue, activeOrders, filter }
router.get('/metrics', dashboardController.getMetrics);

// GET /api/dashboard/sales?filter=diario|semanal|mensual|anual
// Retorna ventas agrupadas según el filtro temporal
// Response: [{ label: 'Lun', valor: 5000 }, ...]
router.get('/sales', dashboardController.getSales);

// GET /api/dashboard/new-users?filter=diario|semanal|mensual|anual
// Retorna usuarios nuevos según el filtro temporal
// Response: [{ label: 'Sem 1', usuarios: 45 }, ...]
router.get('/new-users', dashboardController.getNewUsers);

// GET /api/dashboard/top-products?filter=diario|semanal|mensual|anual
// Retorna los 5 productos más vendidos según el filtro temporal
// Response: [{ name: 'Hamburguesa', value: 35, color: '#FF6B6B' }, ...]
router.get('/top-products', dashboardController.getTopProducts);

// GET /api/dashboard/users-without-orders (NUEVO)
// Retorna los últimos 10 usuarios que NO han hecho pedidos
// Response: [{ id, name, email, date, status, total_pedidos }, ...]
router.get('/users-without-orders', dashboardController.getUsersWithoutOrders);

// GET /api/dashboard/recent-users (BACKUP)
// Retorna los últimos 10 usuarios registrados
// Response: [{ id, name, email, date, status }, ...]
router.get('/recent-users', dashboardController.getRecentUsers);

// GET /api/dashboard/comparisons
// Retorna comparaciones entre períodos (mes actual vs anterior, etc.)
// Response: { users: {...}, revenue: {...}, orders: {...} }
router.get('/comparisons', dashboardController.getComparisons);

// ========================= RUTAS DE COMPATIBILIDAD =========================
// Estas rutas mantienen compatibilidad con el frontend antiguo

// GET /api/dashboard/monthly-sales (DEPRECATED - usar /sales?filter=mensual)
router.get('/monthly-sales', (req, res, next) => {
  req.query.filter = 'mensual';
  dashboardController.getSales(req, res, next);
});

// GET /api/dashboard/weekly-sales (DEPRECATED - usar /sales?filter=semanal)
router.get('/weekly-sales', (req, res, next) => {
  req.query.filter = 'semanal';
  dashboardController.getSales(req, res, next);
});

// ========================= RUTA DE PRUEBA =========================

// GET /api/dashboard
// Ruta de prueba para verificar que el módulo de dashboard funciona
router.get('/', (req, res) => {
  res.json({
    message: '✅ Dashboard API funcionando correctamente',
    version: '2.0.0',
    updated: 'Con filtros temporales',
    endpoints: {
      metrics: 'GET /api/dashboard/metrics?filter=diario|semanal|mensual|anual',
      sales: 'GET /api/dashboard/sales?filter=diario|semanal|mensual|anual',
      newUsers: 'GET /api/dashboard/new-users?filter=diario|semanal|mensual|anual',
      topProducts: 'GET /api/dashboard/top-products?filter=diario|semanal|mensual|anual',
      usersWithoutOrders: 'GET /api/dashboard/users-without-orders (NUEVO)',
      recentUsers: 'GET /api/dashboard/recent-users',
      comparisons: 'GET /api/dashboard/comparisons'
    },
    compatibilidad: {
      monthlySales: 'GET /api/dashboard/monthly-sales (usa /sales?filter=mensual)',
      weeklySales: 'GET /api/dashboard/weekly-sales (usa /sales?filter=semanal)'
    },
    status: 'active',
    database: 'frank_furt',
    port: 3006
  });
});

// ============================================================================
// EXPORTAR ROUTER
// ============================================================================

console.log('✅ Dashboard routes ACTUALIZADAS cargadas');
console.log('📍 Base URL: /api/dashboard');
console.log('🔗 URLs principales:');
console.log('   http://localhost:3006/api/dashboard/metrics?filter=diario');
console.log('   http://localhost:3006/api/dashboard/sales?filter=semanal');
console.log('   http://localhost:3006/api/dashboard/new-users?filter=mensual');
console.log('   http://localhost:3006/api/dashboard/top-products?filter=anual');
console.log('   http://localhost:3006/api/dashboard/users-without-orders');

module.exports = router;
