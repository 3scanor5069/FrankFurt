// routes/ventaRoutes.js
const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const authMiddleware = require('../middleware/authMiddleware');


// POST /api/ventas/manual - Registrar venta manual
router.post('/manual',  ventaController.registrarVentaManual);

// GET /api/ventas - Obtener todas las ventas (opcional para futuras funcionalidades)
router.get('/',  ventaController.obtenerVentas);

// GET /api/ventas/:id - Obtener venta por ID (opcional para futuras funcionalidades)
router.get('/:id',  ventaController.obtenerVentaPorId);

module.exports = router;