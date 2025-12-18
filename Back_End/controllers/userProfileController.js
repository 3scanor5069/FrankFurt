// backend/controllers/userProfileController.js
const bcrypt = require('bcrypt');
const db = require('../config/db');

// ============================================================================
// 1. OBTENER PERFIL DEL USUARIO (GET /api/users/profile)
// ============================================================================
const getProfile = async (req, res) => {
  try {
    // El usuario viene del middleware de autenticación (req.user)
    // Obtener el ID del usuario autenticado desde el token JWT.
    // El token contiene la propiedad `id` que corresponde a `idUsuario` en la base de datos.
    const userId = req.user.id;

    // Consultar datos del usuario
    const [rows] = await db.query(
      `SELECT 
        idUsuario,
        nombre,
        correo,
        rol,
        telefono,
        fecha_registro,
        activo
      FROM usuario 
      WHERE idUsuario = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = rows[0];

    // Enviar respuesta
    res.status(200).json({
      success: true,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      telefono: user.telefono || '',
      fecha_registro: user.fecha_registro,
      activo: user.activo
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil del usuario'
    });
  }
};

// ============================================================================
// 2. ACTUALIZAR PERFIL (PUT /api/users/profile/update)
// ============================================================================
const updateProfile = async (req, res) => {
  try {
    // El token JWT asigna la propiedad `id` a partir del campo idUsuario
    // por lo que debemos usar req.user.id para identificar al usuario
    const userId = req.user.id;
    const { correo, telefono } = req.body;

    // Validaciones básicas
    if (!correo || !correo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El correo es requerido'
      });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo no es válido'
      });
    }

    // Verificar si el correo ya está en uso por otro usuario
    const [existingUser] = await db.query(
      'SELECT idUsuario FROM usuario WHERE correo = ? AND idUsuario != ?',
      [correo, userId]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está en uso por otro usuario'
      });
    }

    // Actualizar datos (nombre NO se puede cambiar, solo correo y teléfono)
    await db.query(
      `UPDATE usuario 
       SET correo = ?, telefono = ?
       WHERE idUsuario = ?`,
      [correo.trim(), telefono?.trim() || null, userId]
    );

    // Obtener datos actualizados
    const [updatedUser] = await db.query(
      'SELECT nombre, correo, telefono, rol FROM usuario WHERE idUsuario = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        nombre: updatedUser[0].nombre,
        correo: updatedUser[0].correo,
        telefono: updatedUser[0].telefono,
        rol: updatedUser[0].rol
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil'
    });
  }
};

// ============================================================================
// 3. CAMBIAR CONTRASEÑA (PUT /api/users/profile/password)
// ============================================================================
const changePassword = async (req, res) => {
  try {
    // El token JWT usa la propiedad `id`, no `idUsuario`
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Validaciones básicas
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren ambas contraseñas'
      });
    }

    // Validar longitud de nueva contraseña
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }

    // Validar complejidad (al menos una letra y un número)
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener letras y números'
      });
    }

    // Obtener contraseña actual hasheada de la base de datos
    // Obtener la contraseña hasheada desde la base de datos.
    // La columna correcta en la tabla `usuario` se llama `password`, no `contraseña`.
    const [rows] = await db.query(
      'SELECT password FROM usuario WHERE idUsuario = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const currentHashedPassword = rows[0].password;

    // Verificar que la contraseña actual sea correcta
    const isPasswordValid = await bcrypt.compare(oldPassword, currentHashedPassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(newPassword, currentHashedPassword);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual'
      });
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña en la base de datos
    // Actualizar la contraseña en la base de datos.  
    // La columna se llama `password`.
    await db.query(
      'UPDATE usuario SET password = ? WHERE idUsuario = ?',
      [hashedNewPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña'
    });
  }
};

// ============================================================================
// 4. ELIMINAR CUENTA (DELETE /api/users/profile/delete)
// ============================================================================
const deleteAccount = async (req, res) => {
  try {
    // El token JWT define la propiedad `id` que corresponde al ID de la tabla `usuario`.
    const userId = req.user.id;
    const { password } = req.body;

    // Validación básica
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es requerida para confirmar'
      });
    }

    // Obtener datos del usuario
    const [rows] = await db.query(
      // Seleccionar la contraseña guardada en la columna correcta (`password`).
      'SELECT password, rol FROM usuario WHERE idUsuario = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = rows[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    // OPCIONAL: Prevenir que admins se eliminen a sí mismos
    // Descomenta si quieres esta protección
    /*
    if (user.rol === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Los administradores no pueden eliminar sus propias cuentas'
      });
    }
    */

    // Usar Soft Delete (marcar como inactivo) en lugar de eliminación física
    // Esto es más seguro y permite recuperación de datos
    await db.query(
      'UPDATE usuario SET activo = 0 WHERE idUsuario = ?',
      [userId]
    );

    // Si prefieres eliminación física (NO RECOMENDADO), usa esto en su lugar:
    // await db.query('DELETE FROM usuario WHERE idUsuario = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'Cuenta eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la cuenta'
    });
  }
};

// ============================================================================
// EXPORTAR FUNCIONES
// ============================================================================
module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
};