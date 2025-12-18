import { jwtDecode } from 'jwt-decode';

/**
 * Utilidades para el manejo de tokens JWT
 */

// Clave para localStorage
const TOKEN_KEY = 'authToken';

/**
 * Guarda el token en localStorage
 * @param {string} token - El token JWT
 * @returns {boolean} - True si se guardó correctamente
 */
export const saveToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token no válido');
    }
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error guardando token:', error);
    return false;
  }
};

/**
 * Obtiene el token desde localStorage
 * @returns {string|null} - El token o null si no existe
 */
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
};

/**
 * Elimina el token de localStorage
 * @returns {boolean} - True si se eliminó correctamente
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error eliminando token:', error);
    return false;
  }
};

/**
 * Decodifica un token JWT
 * @param {string} token - El token JWT
 * @returns {object|null} - Los datos decodificados o null si hay error
 */
export const decodeToken = (token) => {
  try {
    if (!token) {
      return null;
    }
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * Verifica si un token ha expirado
 * @param {string} token - El token JWT
 * @returns {boolean} - True si ha expirado
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error verificando expiración:', error);
    return true;
  }
};

/**
 * Obtiene el tiempo restante antes de que expire el token
 * @param {string} token - El token JWT
 * @returns {number} - Segundos restantes (0 si ha expirado)
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const currentTime = Date.now() / 1000;
    const timeRemaining = decoded.exp - currentTime;
    
    return Math.max(0, timeRemaining);
  } catch (error) {
    console.error('Error calculando tiempo restante:', error);
    return 0;
  }
};

/**
 * Formatea el tiempo restante en un formato legible
 * @param {number} seconds - Segundos restantes
 * @returns {string} - Tiempo formateado (ej: "2h 30m")
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) {
    return 'Expirado';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${Math.floor(seconds)}s`;
  }
};

/**
 * Verifica si el token es válido (existe y no ha expirado)
 * @param {string} token - El token JWT
 * @returns {boolean} - True si es válido
 */
export const isTokenValid = (token) => {
  return token && !isTokenExpired(token);
};

/**
 * Extrae información del usuario desde el token
 * @param {string} token - El token JWT
 * @returns {object|null} - Datos del usuario o null si hay error
 */
export const getUserFromToken = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      return null;
    }
    
    return {
      id: decoded.id,
      name: decoded.nombreUsuario,
      role: decoded.rol,
      email: decoded.email || '',
      exp: decoded.exp,
      iat: decoded.iat
    };
  } catch (error) {
    console.error('Error extrayendo usuario del token:', error);
    return null;
  }
};

/**
 * Crea headers de autorización para requests HTTP
 * @param {string} token - El token JWT (opcional, si no se proporciona lo obtiene de localStorage)
 * @returns {object} - Headers con autorización
 */
export const getAuthHeaders = (token = null) => {
  const authToken = token || getToken();
  
  if (!authToken) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Configura axios con interceptores para manejo automático de tokens
 * @param {object} axiosInstance - Instancia de axios
 */
export const setupAxiosInterceptors = (axiosInstance) => {
  // Interceptor para requests - agregar token automáticamente
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token && isTokenValid(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para responses - manejar token expirado
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        removeToken();
        // Opcional: redirigir al login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

/**
 * Hook personalizado para verificar permisos basados en rol
 */
export const createRoleChecker = (userRole) => {
  const roles = {
    'Cliente': 1,
    'Empleado': 2,
    'Manager': 3,
    'Administrador': 4
  };

  return {
    isClient: () => userRole === 'Cliente',
    isEmployee: () => userRole === 'Empleado',
    isManager: () => userRole === 'Manager',
    isAdmin: () => userRole === 'Administrador',
    hasMinimumRole: (minimumRole) => {
      return roles[userRole] >= roles[minimumRole];
    },
    canAccess: (requiredRoles) => {
      return requiredRoles.includes(userRole);
    }
  };
};