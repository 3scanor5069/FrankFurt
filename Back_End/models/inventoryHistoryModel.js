// models/inventoryHistoryModel.js
import pool from "../config/db.js";

const InventoryHistory = {
  // Obtener todos los movimientos de inventario
  getAll: (callback) => {
    pool.query(
      "SELECT * FROM inventario_movimientos ORDER BY fecha DESC",
      callback
    );
  },

  // Crear un nuevo movimiento de inventario
  create: (data, callback) => {
    const { idInventario, cantidad, tipo } = data;
    pool.query(
      "INSERT INTO inventario_movimientos (idInventario, cantidad, tipo) VALUES (?, ?, ?)",
      [idInventario, cantidad, tipo],
      callback
    );
  }
};

export default InventoryHistory;
