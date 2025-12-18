const db = require("../config/db");

// ===================================================================
// OBTENER HISTORIAL DE INVENTARIO
// ===================================================================
const getInventoryHistory = async (req, res) => {
  try {
    // Consulta a la tabla correcta: inventario_general
    const [rows] = await db.query(`
      SELECT 
        idMovimiento,
        nombre_insumo as nombreProducto,
        cantidad_movida as cantidad,
        tipo_movimiento as tipo,
        motivo_detalle as motivo,
        observaciones,
        fecha_movimiento as fecha,
        idSede
      FROM inventario_general 
      ORDER BY fecha_movimiento DESC
    `);

    // Retornar en el formato que espera el frontend
    res.status(200).json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    res.status(500).json({ 
      success: false,
      error: "Error al obtener historial de inventario",
      details: error.message 
    });
  }
};

// ===================================================================
// INSERTAR MOVIMIENTO EN HISTORIAL
// ===================================================================
const addInventoryHistory = async (req, res) => {
  try {
    const { 
      nombre_insumo, 
      cantidad_movida, 
      tipo_movimiento, 
      motivo_detalle,
      observaciones,
      idSede 
    } = req.body;

    // Validaciones
    if (!nombre_insumo || !cantidad_movida || !tipo_movimiento || !motivo_detalle) {
      return res.status(400).json({ 
        success: false,
        error: "Faltan campos obligatorios" 
      });
    }

    // Validar tipo de movimiento
    const tiposValidos = ['entrada', 'salida'];
    if (!tiposValidos.includes(tipo_movimiento)) {
      return res.status(400).json({ 
        success: false,
        error: "Tipo de movimiento inválido. Debe ser 'entrada' o 'salida'" 
      });
    }

    // Validar motivo
    const motivosValidos = ['compra', 'venta/consumo', 'merma/desperdicio', 'ajuste_conteo', 'desperdicio'];
    if (!motivosValidos.includes(motivo_detalle)) {
      return res.status(400).json({ 
        success: false,
        error: "Motivo inválido" 
      });
    }

    // Validar cantidad
    if (parseFloat(cantidad_movida) <= 0) {
      return res.status(400).json({ 
        success: false,
        error: "La cantidad debe ser mayor a 0" 
      });
    }

    // Insertar en la tabla correcta
    const [result] = await db.query(
      `INSERT INTO inventario_general 
        (nombre_insumo, cantidad_movida, tipo_movimiento, motivo_detalle, observaciones, fecha_movimiento, idSede) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [
        nombre_insumo, 
        parseFloat(cantidad_movida), 
        tipo_movimiento, 
        motivo_detalle,
        observaciones || null,
        idSede || 1
      ]
    );

    res.status(201).json({ 
      success: true,
      message: "Movimiento agregado correctamente",
      data: {
        idMovimiento: result.insertId,
        nombre_insumo,
        cantidad_movida,
        tipo_movimiento,
        motivo_detalle
      }
    });

  } catch (error) {
    console.error('❌ Error al insertar movimiento:', error);
    res.status(500).json({ 
      success: false,
      error: "Error al insertar movimiento en el historial",
      details: error.message 
    });
  }
};

// ===================================================================
// OBTENER HISTORIAL FILTRADO POR FECHA
// ===================================================================
const getInventoryHistoryByDate = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo_movimiento, idSede } = req.query;

    let query = `
      SELECT 
        idMovimiento,
        nombre_insumo as nombreProducto,
        cantidad_movida as cantidad,
        tipo_movimiento as tipo,
        motivo_detalle as motivo,
        observaciones,
        fecha_movimiento as fecha,
        idSede
      FROM inventario_general 
      WHERE 1=1
    `;
    
    const params = [];

    if (fecha_inicio) {
      query += ` AND fecha_movimiento >= ?`;
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ` AND fecha_movimiento <= ?`;
      params.push(fecha_fin);
    }

    if (tipo_movimiento && ['entrada', 'salida'].includes(tipo_movimiento)) {
      query += ` AND tipo_movimiento = ?`;
      params.push(tipo_movimiento);
    }

    if (idSede) {
      query += ` AND idSede = ?`;
      params.push(idSede);
    }

    query += ` ORDER BY fecha_movimiento DESC`;

    const [rows] = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('❌ Error al filtrar historial:', error);
    res.status(500).json({ 
      success: false,
      error: "Error al filtrar historial",
      details: error.message 
    });
  }
};

// ===================================================================
// OBTENER RESUMEN DE MOVIMIENTOS
// ===================================================================
const getInventorySummary = async (req, res) => {
  try {
    const [summary] = await db.query(`
      SELECT 
        COUNT(*) as total_movimientos,
        SUM(CASE WHEN tipo_movimiento = 'entrada' THEN 1 ELSE 0 END) as total_entradas,
        SUM(CASE WHEN tipo_movimiento = 'salida' THEN 1 ELSE 0 END) as total_salidas,
        SUM(CASE WHEN tipo_movimiento = 'entrada' THEN cantidad_movida ELSE 0 END) as cantidad_total_entradas,
        SUM(CASE WHEN tipo_movimiento = 'salida' THEN cantidad_movida ELSE 0 END) as cantidad_total_salidas
      FROM inventario_general
    `);

    res.status(200).json({
      success: true,
      data: summary[0]
    });

  } catch (error) {
    console.error('❌ Error al obtener resumen:', error);
    res.status(500).json({ 
      success: false,
      error: "Error al obtener resumen de inventario",
      details: error.message 
    });
  }
};

module.exports = { 
  getInventoryHistory, 
  addInventoryHistory,
  getInventoryHistoryByDate,
  getInventorySummary
};