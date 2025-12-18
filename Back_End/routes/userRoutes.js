const express = require('express');
const router = express.Router();

// Importar controladores
const userController = require('../controllers/userController');
const userProfileController = require('../controllers/userProfileController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Rutas de usuarios
 *
 * Este enrutador expone las operaciones necesarias para gestionar usuarios en
 * el panel administrativo así como registrar, autenticar y verificar a un
 * usuario en el sistema.  Todas las rutas de CRUD y de perfil están
 * protegidas mediante el middleware `protect`, por lo que requieren que el
 * cliente envíe el token JWT en la cabecera Authorization.  El login y
 * registro no requieren autenticación previa.  Para operaciones que
 * únicamente deben estar disponibles para administradores (como crear,
 * actualizar o inactivar usuarios), el middleware `authorize` puede
 * activarse pasando el rol permitido.
 */

// ---------------------------------------------------------------------------
// CRUD de usuarios (requiere autenticación y rol de administrador)
// ---------------------------------------------------------------------------
// Obtener listado de usuarios
router.get('/', protect, authorize('administrador'), userController.getAllUsers);

// Crear un nuevo usuario
router.post('/', protect, authorize('administrador'), userController.createUser);

// Actualizar un usuario existente
router.put('/:id', protect, authorize('administrador'), userController.updateUser);

// Inactivar (eliminar lógico) un usuario existente
router.delete('/:id', protect, authorize('administrador'), userController.deleteUser);

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------
// Registro de usuario (clientes): no requiere estar autenticado
router.post('/register', userController.registerUser);

// Login: recibe correo y contraseña, retorna token y datos de usuario
router.post('/login', userController.loginUser);

// Verificar token: retorna la información almacenada en el token
router.get('/verify', userController.verifyToken);

// ---------------------------------------------------------------------------
// Perfil de usuario (requiere autenticación)
// ---------------------------------------------------------------------------
// Obtener información del perfil del usuario autenticado
router.get('/profile', protect, userProfileController.getProfile);

// Actualizar correo y teléfono del usuario autenticado
router.put('/profile/update', protect, userProfileController.updateProfile);

// Cambiar contraseña del usuario autenticado
router.put('/profile/password', protect, userProfileController.changePassword);

// Eliminar (desactivar) la cuenta del usuario autenticado
router.delete('/profile/delete', protect, userProfileController.deleteAccount);

module.exports = router;