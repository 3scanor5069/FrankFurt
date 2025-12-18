const pool = require("../config/db");

// ========================================
// 📊 ENDPOINT PRINCIPAL - Stock Actual
// ========================================

/**
 * Obtener inventario desde la vista de stock actual
 * GET /api/inventory
 */
exports.getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        vsa.nombre_insumo,
        vsa.unidad_medida,
        vsa.stock_disponible,
        vsa.stock_minimo_insumo,
        vsa.idSede,
        ic.fecha_vencimiento,
        CASE 
          WHEN vsa.stock_disponible = 0 THEN 'Agotado'
          WHEN vsa.stock_disponible <= (vsa.stock_minimo_insumo * 0.5) THEN 'Stock Crítico'
          WHEN vsa.stock_disponible <= vsa.stock_minimo_insumo THEN 'Stock Bajo'
          ELSE 'En Stock'
        END as estado,
        CASE 
          WHEN ic.fecha_vencimiento IS NOT NULL 
          THEN DATEDIFF(ic.fecha_vencimiento, CURDATE())
          ELSE NULL
        END as dias_hasta_vencimiento
      FROM vista_stock_actual vsa
      LEFT JOIN insumos_config ic ON vsa.nombre_insumo = ic.nombre_insumo
      ORDER BY vsa.stock_disponible ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    res.status(500).json({ 
      message: "Error al obtener inventario", 
      error: error.message 
    });
  }
};

// ========================================
// 📈 ENDPOINTS DE ESTADÍSTICAS
// ========================================

/**
 * Obtener estadísticas para las Stats Cards
 * GET /api/inventory/stats
 */
exports.getInventoryStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_insumos,
        SUM(CASE 
          WHEN stock_disponible > stock_minimo_insumo THEN 1 
          ELSE 0 
        END) as en_stock,
        SUM(CASE 
          WHEN stock_disponible <= stock_minimo_insumo 
          AND stock_disponible > (stock_minimo_insumo * 0.5) 
          THEN 1 
          ELSE 0 
        END) as stock_bajo,
        SUM(CASE 
          WHEN stock_disponible <= (stock_minimo_insumo * 0.5) 
          AND stock_disponible > 0 
          THEN 1 
          ELSE 0 
        END) as stock_critico,
        SUM(CASE 
          WHEN stock_disponible = 0 THEN 1 
          ELSE 0 
        END) as agotado,
        SUM(CASE 
          WHEN stock_disponible <= stock_minimo_insumo 
          AND stock_disponible > 0
          THEN 1 
          ELSE 0 
        END) as requiere_atencion
      FROM vista_stock_actual
    `);
    
    res.json(stats[0]);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ 
      message: "Error al obtener estadísticas", 
      error: error.message 
    });
  }
};

// ========================================
// 🔍 ENDPOINTS DE FILTROS POR ESTADO
// ========================================

/**
 * Obtener insumos en buen estado (En Stock)
 * GET /api/inventory/in-stock
 */
exports.getInsumosInStock = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        nombre_insumo,
        unidad_medida,
        stock_disponible,
        stock_minimo_insumo,
        idSede,
        'En Stock' as estado
      FROM vista_stock_actual
      WHERE stock_disponible > stock_minimo_insumo
      ORDER BY nombre_insumo ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener insumos en stock:", error);
    res.status(500).json({ 
      message: "Error al obtener insumos en stock", 
      error: error.message 
    });
  }
};

/**
 * Obtener insumos que requieren atención (Stock Bajo + Stock Crítico)
 * GET /api/inventory/low-stock
 */
exports.getInsumosLowStock = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        nombre_insumo,
        unidad_medida,
        stock_disponible,
        stock_minimo_insumo,
        idSede,
        CASE 
          WHEN stock_disponible <= (stock_minimo_insumo * 0.5) THEN 'Stock Crítico'
          ELSE 'Stock Bajo'
        END as estado
      FROM vista_stock_actual
      WHERE stock_disponible <= stock_minimo_insumo 
        AND stock_disponible > 0
      ORDER BY stock_disponible ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener insumos con stock bajo:", error);
    res.status(500).json({ 
      message: "Error al obtener insumos con stock bajo", 
      error: error.message 
    });
  }
};

/**
 * Obtener insumos agotados
 * GET /api/inventory/out-of-stock
 */
exports.getInsumosOutOfStock = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        nombre_insumo,
        unidad_medida,
        stock_disponible,
        stock_minimo_insumo,
        idSede,
        'Agotado' as estado
      FROM vista_stock_actual
      WHERE stock_disponible = 0
      ORDER BY nombre_insumo ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener insumos agotados:", error);
    res.status(500).json({ 
      message: "Error al obtener insumos agotados", 
      error: error.message 
    });
  }
};

// ========================================
// 📝 REGISTRO DE MOVIMIENTOS
// ========================================

/**
 * Registrar un movimiento de inventario (Entrada/Salida)
 * POST /api/inventory/movement
 * 
 * Body esperado:
 * {
 *   nombre_insumo: "Paquete de Pan (x24)",
 *   cantidad_movida: 10,
 *   tipo_movimiento: "entrada" | "salida",
 *   motivo_detalle: "compra" | "venta/consumo" | "merma/desperdicio" | "ajuste_conteo",
 *   observaciones: "Texto opcional",
 *   idSede: 1
 * }
 */
exports.recordInventoryMovement = async (req, res) => {
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
      message: "Faltan campos obligatorios: nombre_insumo, cantidad_movida, tipo_movimiento, motivo_detalle" 
    });
  }

  if (!['entrada', 'salida'].includes(tipo_movimiento)) {
    return res.status(400).json({ 
      message: "tipo_movimiento debe ser 'entrada' o 'salida'" 
    });
  }

  const motivosValidos = ['compra', 'venta/consumo', 'merma/desperdicio', 'ajuste_conteo'];
  if (!motivosValidos.includes(motivo_detalle)) {
    return res.status(400).json({ 
      message: `motivo_detalle debe ser uno de: ${motivosValidos.join(', ')}` 
    });
  }

  if (cantidad_movida <= 0) {
    return res.status(400).json({ 
      message: "La cantidad_movida debe ser mayor a 0" 
    });
  }

  try {
    // Insertar el movimiento en la tabla inventario_general
    const [result] = await pool.query(`
      INSERT INTO inventario_general (
        nombre_insumo,
        cantidad_movida,
        tipo_movimiento,
        motivo_detalle,
        observaciones,
        idSede,
        fecha_movimiento
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      nombre_insumo,
      cantidad_movida,
      tipo_movimiento,
      motivo_detalle,
      observaciones || null,
      idSede || 1
    ]);

    res.status(201).json({
      message: `Movimiento de ${tipo_movimiento} registrado correctamente`,
      idMovimiento: result.insertId,
      nombre_insumo,
      cantidad_movida,
      tipo_movimiento,
      motivo_detalle
    });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    res.status(500).json({ 
      message: "Error al registrar movimiento", 
      error: error.message 
    });
  }
};

// ========================================
// 📋 LISTA DE INSUMOS (Para Selector)
// ========================================

/**
 * Obtener lista de nombres de insumos disponibles
 * GET /api/inventory/insumos-list
 */
exports.getInsumosList = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT 
        nombre_insumo,
        unidad_medida,
        stock_disponible
      FROM vista_stock_actual
      ORDER BY nombre_insumo ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener lista de insumos:", error);
    res.status(500).json({ 
      message: "Error al obtener lista de insumos", 
      error: error.message 
    });
  }
};

// ========================================
// 📜 HISTORIAL DE MOVIMIENTOS
// ========================================

/**
 * Obtener historial de movimientos de un insumo específico
 * GET /api/inventory/movements/:nombre_insumo
 */
exports.getMovementHistory = async (req, res) => {
  const { nombre_insumo } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        idMovimiento,
        nombre_insumo,
        cantidad_movida,
        tipo_movimiento,
        motivo_detalle,
        observaciones,
        fecha_movimiento,
        idSede
      FROM inventario_general
      WHERE nombre_insumo = ?
      ORDER BY fecha_movimiento DESC
      LIMIT 50
    `, [nombre_insumo]);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial de movimientos:", error);
    res.status(500).json({ 
      message: "Error al obtener historial de movimientos", 
      error: error.message 
    });
  }
};

/**
 * Obtener todos los movimientos recientes
 * GET /api/inventory/movements
 */
exports.getAllMovements = async (req, res) => {
  const limit = req.query.limit || 100;

  try {
    const [rows] = await pool.query(`
      SELECT 
        idMovimiento,
        nombre_insumo,
        cantidad_movida,
        tipo_movimiento,
        motivo_detalle,
        observaciones,
        fecha_movimiento,
        idSede
      FROM inventario_general
      ORDER BY fecha_movimiento DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    res.status(500).json({ 
      message: "Error al obtener movimientos", 
      error: error.message 
    });
  }
};

// ========================================
// 🔍 BUSCAR INSUMO ESPECÍFICO
// ========================================

/**
 * Buscar un insumo por nombre
 * GET /api/inventory/search?q=nombre
 */
exports.searchInsumo = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({ 
      message: "El parámetro de búsqueda 'q' es requerido" 
    });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        nombre_insumo,
        unidad_medida,
        stock_disponible,
        stock_minimo_insumo,
        idSede,
        CASE 
          WHEN stock_disponible = 0 THEN 'Agotado'
          WHEN stock_disponible <= (stock_minimo_insumo * 0.5) THEN 'Stock Crítico'
          WHEN stock_disponible <= stock_minimo_insumo THEN 'Stock Bajo'
          ELSE 'En Stock'
        END as estado
      FROM vista_stock_actual
      WHERE nombre_insumo LIKE ?
      ORDER BY nombre_insumo ASC
    `, [`%${q}%`]);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al buscar insumo:", error);
    res.status(500).json({ 
      message: "Error al buscar insumo", 
      error: error.message 
    });
  }
};

// ========================================
// 📅 OBTENER PRODUCTOS PRÓXIMOS A VENCER
// ========================================

/**
 * Obtener productos próximos a vencer (dentro de 30 días)
 * GET /api/inventory/proximos-vencer
 */
exports.getInsumosProximosVencer = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ic.nombre_insumo,
        ic.unidad_medida,
        ic.stock_minimo_insumo,
        ic.fecha_vencimiento,
        DATEDIFF(ic.fecha_vencimiento, CURDATE()) as dias_hasta_vencimiento,
        vsa.stock_disponible,
        ic.idSede,
        CASE 
          WHEN DATEDIFF(ic.fecha_vencimiento, CURDATE()) <= 0 THEN 'Vencido'
          WHEN DATEDIFF(ic.fecha_vencimiento, CURDATE()) <= 7 THEN 'Vence en menos de 1 semana'
          WHEN DATEDIFF(ic.fecha_vencimiento, CURDATE()) <= 15 THEN 'Vence en menos de 2 semanas'
          WHEN DATEDIFF(ic.fecha_vencimiento, CURDATE()) <= 30 THEN 'Vence en menos de 1 mes'
          ELSE 'Normal'
        END as estado_vencimiento
      FROM insumos_config ic
      LEFT JOIN vista_stock_actual vsa ON ic.nombre_insumo = vsa.nombre_insumo
      WHERE ic.fecha_vencimiento IS NOT NULL
        AND DATEDIFF(ic.fecha_vencimiento, CURDATE()) <= 30
      ORDER BY dias_hasta_vencimiento ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos próximos a vencer:", error);
    res.status(500).json({ 
      message: "Error al obtener productos próximos a vencer", 
      error: error.message 
    });
  }
};