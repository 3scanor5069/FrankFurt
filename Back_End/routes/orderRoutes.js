const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// ============================================================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================================================

// GET /api/pedidos/status-board - Obtener tablero Kanban con todos los pedidos
router.get('/pedidos/status-board', protect, orderController.getStatusBoard);

// GET /api/mesas/available - Obtener mesas disponibles
router.get('/mesas/available', protect, orderController.getAvailableMesas);

// GET /api/menu/products - Obtener productos del menú con stock
router.get('/menu/products', protect, orderController.getMenuProducts);

// GET /api/users/clientes - Obtener lista de clientes
router.get('/users/clientes', protect, orderController.getClientes);

// POST /api/pedidos/manual-create - Crear pedido/venta manual
router.post('/pedidos/manual-create', protect, orderController.createManualOrder);

// PUT /api/pedidos/:idPedido/update-status - Actualizar estado del pedido
router.put('/pedidos/:idPedido/update-status', protect, orderController.updateOrderStatus);

// POST /api/pedidos/:idPedido/pay - Procesar pago y cerrar pedido
router.post('/pedidos/:idPedido/pay', protect, orderController.processPayment);

// ============================================================================
// EXPORTAR ROUTER
// ============================================================================
module.exports = router;