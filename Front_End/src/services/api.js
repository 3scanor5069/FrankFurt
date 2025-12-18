import axios from 'axios';

// Configuración base de axios
// La API por defecto se sirve en el puerto 3006.  Se toma la raíz del backend
// de la variable de entorno REACT_APP_API_URL. Esta variable **no** debe incluir
// el sufijo `/api`. Si no se define, se utiliza por defecto 'http://localhost:3006'.
// A partir de esta raíz se construye la URL base añadiendo '/api'.
const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:3006';
const API_BASE_URL = `${API_ROOT}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // Error con respuesta del servidor
      const { status, data } = error.response;
      switch (status) {
        case 400:
          console.error('Error de validación:', data.message);
          break;
        case 404:
          console.error('Recurso no encontrado:', data.message);
          break;
        case 500:
          console.error('Error interno del servidor:', data.message);
          break;
        default:
          console.error('Error desconocido:', data.message);
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de conexión:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Servicios para Mesas
export const mesasAPI = {
  // Obtener todas las mesas
  obtenerMesas: async () => {
    try {
      const response = await apiClient.get('/mesas');
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo mesas: ${error.message}`);
    }
  },

  // Obtener una mesa específica
  obtenerMesa: async (mesaId) => {
    try {
      const response = await apiClient.get(`/mesas/${mesaId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo mesa ${mesaId}: ${error.message}`);
    }
  },

  // Activar mesa para iniciar pedido
  activarMesa: async (mesaId) => {
    try {
      const response = await apiClient.post(`/mesas/${mesaId}/activar`);
      return response.data;
    } catch (error) {
      throw new Error(`Error activando mesa ${mesaId}: ${error.message}`);
    }
  },

  // Cambiar estado de mesa
  cambiarEstadoMesa: async (mesaId, estado) => {
    try {
      const response = await apiClient.put(`/mesas/${mesaId}/estado`, { estado });
      return response.data;
    } catch (error) {
      throw new Error(`Error cambiando estado de mesa ${mesaId}: ${error.message}`);
    }
  },
};

// Servicios para Productos
export const productosAPI = {
  // Obtener todos los productos
  obtenerProductos: async (categoria = null) => {
    try {
      const params = categoria ? { categoria } : {};
      const response = await apiClient.get('/productos', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo productos: ${error.message}`);
    }
  },

  // Obtener un producto específico
  obtenerProducto: async (productoId) => {
    try {
      const response = await apiClient.get(`/productos/${productoId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo producto ${productoId}: ${error.message}`);
    }
  },

  // Obtener categorías de productos
  obtenerCategorias: async () => {
    try {
      const response = await apiClient.get('/productos/categorias');
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo categorías: ${error.message}`);
    }
  },

  // Crear nuevo producto (para futura administración)
  crearProducto: async (productoData) => {
    try {
      const response = await apiClient.post('/productos', productoData);
      return response.data;
    } catch (error) {
      throw new Error(`Error creando producto: ${error.message}`);
    }
  },
};

// Servicios para Órdenes
export const ordenesAPI = {
  // Obtener todas las órdenes
  obtenerOrdenes: async () => {
    try {
      const response = await apiClient.get('/ordenes');
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo órdenes: ${error.message}`);
    }
  },

  // Obtener una orden específica
  obtenerOrden: async (ordenId) => {
    try {
      const response = await apiClient.get(`/ordenes/${ordenId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo orden ${ordenId}: ${error.message}`);
    }
  },

  // Crear nueva orden para una mesa
  crearOrden: async (mesaId, ordenData) => {
    try {
      const response = await apiClient.post(`/ordenes/mesa/${mesaId}`, ordenData);
      return response.data;
    } catch (error) {
      throw new Error(`Error creando orden para mesa ${mesaId}: ${error.message}`);
    }
  },

  // Actualizar estado de una orden
  actualizarEstadoOrden: async (ordenId, estado) => {
    try {
      const response = await apiClient.put(`/ordenes/${ordenId}/estado`, { estado });
      return response.data;
    } catch (error) {
      throw new Error(`Error actualizando estado de orden ${ordenId}: ${error.message}`);
    }
  },

  // Obtener órdenes de una mesa específica
  obtenerOrdenesMesa: async (mesaId) => {
    try {
      const response = await apiClient.get(`/ordenes/mesa/${mesaId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo órdenes de mesa ${mesaId}: ${error.message}`);
    }
  },
};

// Utilidades para manejo de errores
export const handleApiError = (error, defaultMessage = 'Error en la operación') => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || defaultMessage;
};

// Función para verificar la conectividad con la API
export const verificarConectividad = async () => {
  try {
    const response = await apiClient.get('/');
    return {
      conectado: true,
      mensaje: response.data.message || 'API conectada correctamente',
    };
  } catch (error) {
    return {
      conectado: false,
      mensaje: 'No se pudo conectar con la API',
      error: error.message,
    };
  }
};

export default {
  mesasAPI,
  productosAPI,
  ordenesAPI,
  handleApiError,
  verificarConectividad,
};