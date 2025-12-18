// services/inventoryService.js

const pool = require('../config/db'); // Ajusta la ruta a tu archivo de conexión si es diferente.

// Función para obtener todos los productos del inventario
exports.getAllInventory = async () => {
  try {
    const sql = `SELECT * FROM inventario`;
    const [rows] = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error en el servicio de inventario (getAllInventory):', error);
    throw error;
  }
};

// Función para crear un nuevo producto en el inventario
exports.createInventoryItem = async (data) => {
  // Lógica para insertar un nuevo producto en la base de datos
  // ...
  return { message: 'Item creado con éxito' };
};

// ... Puedes añadir más funciones aquí (actualizar, eliminar, etc.)