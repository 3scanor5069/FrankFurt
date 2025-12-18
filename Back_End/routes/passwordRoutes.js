// routes/passwordRoutes.js - CON CÓDIGO DE VERIFICACIÓN
const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

// PASO 1: Enviar código de verificación al correo
router.post('/forgot-password', passwordController.sendVerificationCode);

// PASO 2: Verificar código
router.post('/verify-code', passwordController.verifyCode);

// PASO 3: Restablecer contraseña
router.post('/reset-password', passwordController.resetPassword);

module.exports = router;
