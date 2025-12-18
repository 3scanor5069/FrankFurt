const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');
const { protect } = require('../middleware/authMiddleware');

// ============================================================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================================================

// GET /api/users/profile - Obtener datos del perfil del usuario logueado
router.get('/profile', protect, userProfileController.getProfile);

// PUT /api/users/profile/update - Actualizar nombre y correo del usuario
router.put('/profile/update', protect, userProfileController.updateProfile);

// PUT /api/users/profile/password - Cambiar contraseña del usuario
router.put('/profile/password', protect, userProfileController.changePassword);

// DELETE /api/users/profile/delete - Eliminar cuenta del usuario
router.delete('/profile/delete', protect, userProfileController.deleteAccount);

// ============================================================================
// EXPORTAR ROUTER
// ============================================================================
module.exports = router;
