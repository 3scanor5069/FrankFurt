// routes/reportsRoutes.js
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Proteger todas las rutas - solo administrador y empleado
router.use(protect);
router.use(authorize('administrador', 'empleado')); // ✅ CORREGIDO: 'administrador' en lugar de 'admin'

// Rutas de reportes
router.get('/sales', reportsController.getSalesReport);
router.get('/products', reportsController.getProductsReport);
router.get('/frequent-clients', reportsController.getFrequentClientsReport);

module.exports = router;