const jwt = require('jsonwebtoken');

/**
 * 🔐 PROTECT
 * Middleware que valida el token JWT y agrega los datos del usuario a req.user
 */
function protect(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token, autorización denegada' });
  }

  try {
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Formato inválido. Use: Bearer <token>' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar el JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar datos del usuario autenticado
    req.user = decoded;

    next();
  } catch (err) {
    console.error("ERROR JWT:", err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }

    return res.status(401).json({ message: 'Error de autenticación' });
  }
}

/**
 * 👮‍♂️ AUTHORIZE
 * Middleware que valida roles autorizados
 * ✅ CORREGIDO: Usa 'rol' en lugar de 'role' para coincidir con el token JWT
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      console.error('❌ AUTHORIZE: req.user no existe');
      return res.status(401).json({ message: 'No autenticado' });
    }

    // ✅ CORREGIDO: Usar 'rol' (como está en el token JWT) en lugar de 'role'
    const userRole = req.user.rol;

    if (!userRole) {
      console.error('❌ AUTHORIZE: El token no tiene el campo "rol"');
      console.error('Token data:', req.user);
      return res.status(403).json({ 
        message: 'Token inválido: falta información de rol',
        debug: 'El token no contiene el campo "rol"'
      });
    }

    if (!roles.includes(userRole)) {
      console.error(`❌ AUTHORIZE: Rol "${userRole}" no autorizado. Roles permitidos:`, roles);
      return res.status(403).json({ 
        message: 'No tienes permisos para acceder a este recurso',
        yourRole: userRole,
        requiredRoles: roles
      });
    }

    console.log(`✅ AUTHORIZE: Usuario con rol "${userRole}" autorizado`);
    next();
  };
}

module.exports = { protect, authorize };