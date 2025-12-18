import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Filter,
  Calendar,
} from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./InventoryCrud.css";

// Importar historial de inventario para mostrarlo dentro de esta página
// Esta sección permitirá ver el historial sin salir del módulo de inventario
import InventoryHistory from "./InventoryHistory";

const InventoryCrud = () => {
  // ========================================
  // ESTADOS
  // ========================================
  const [inventoryItems, setInventoryItems] = useState([]);
  const [insumosList, setInsumosList] = useState([]);
  const [proximosVencer, setProximosVencer] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [isLoading, setIsLoading] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    total_insumos: 0,
    en_stock: 0,
    requiere_atencion: 0,
    agotado: 0,
    proximos_vencer: 0
  });

  // Modales
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // Modal para historial
  const [detailModalData, setDetailModalData] = useState({
    title: "",
    items: [],
    isVencimiento: false
  });

  // Formulario de Movimiento
  const [movementForm, setMovementForm] = useState({
    nombre_insumo: "",
    cantidad_movida: "",
    tipo_movimiento: "entrada",
    motivo_detalle: "",
    observaciones: "",
    idSede: 1
  });

  // Construye la URL base a partir de la variable de entorno REACT_APP_API_URL.
  // Si no se define, se utiliza 'http://localhost:3006'. Luego se añade '/api/inventory'
  // para apuntar al endpoint adecuado.
  const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3006'}/api/inventory`;

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchInventory(),
        fetchStats(),
        fetchInsumosList(),
        fetchProximosVencer()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      toast.error('Error al cargar datos del inventario', {
        position: "top-right",
        autoClose: 4000
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // FUNCIONES DE FETCH
  // ========================================

  const fetchInventory = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      const data = await res.json();
      setInventoryItems(data);
    } catch (err) {
      console.error("Error cargando inventario:", err);
      throw err;
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
      throw err;
    }
  };

  const fetchInsumosList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/insumos-list`);
      const data = await res.json();
      setInsumosList(data);
    } catch (err) {
      console.error("Error cargando lista de insumos:", err);
      throw err;
    }
  };

  const fetchProximosVencer = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/proximos-vencer`);
      const data = await res.json();
      setProximosVencer(data);
      // Actualizar stats con el conteo de próximos a vencer
      setStats(prev => ({
        ...prev,
        proximos_vencer: data.length
      }));
    } catch (err) {
      console.error("Error cargando productos próximos a vencer:", err);
      // No lanzar error para que no afecte la carga de otros datos
    }
  };

  // ========================================
  // MANEJO DE STATS CARDS
  // ========================================

  const handleStatsCardClick = async (cardType) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      let title = '';

      switch(cardType) {
        case 'all':
          setDetailModalData({
            title: "Todos los Insumos",
            items: inventoryItems
          });
          setShowDetailModal(true);
          setIsLoading(false);
          return;
        
        case 'in-stock':
          endpoint = `${API_BASE_URL}/in-stock`;
          title = "Insumos en Buen Estado";
          break;
        
        case 'low-stock':
          endpoint = `${API_BASE_URL}/low-stock`;
          title = "Insumos que Requieren Atención";
          break;
        
        case 'out-of-stock':
          endpoint = `${API_BASE_URL}/out-of-stock`;
          title = "Insumos Agotados";
          break;
        
        case 'proximos-vencer':
          setDetailModalData({
            title: "Productos Próximos a Vencer",
            items: proximosVencer,
            isVencimiento: true
          });
          setShowDetailModal(true);
          setIsLoading(false);
          return;
        
        default:
          return;
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      setDetailModalData({
        title,
        items: data
      });
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error al obtener datos filtrados:', error);
      toast.error('Error al cargar los datos filtrados', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // MANEJO DE FORMULARIO DE MOVIMIENTO
  // ========================================

  const handleMovementFormChange = useCallback((field, value) => {
    setMovementForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmitMovement = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!movementForm.nombre_insumo) {
      toast.error('Debes seleccionar un insumo', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    if (!movementForm.cantidad_movida || movementForm.cantidad_movida <= 0) {
      toast.error('La cantidad debe ser mayor a 0', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    if (!movementForm.motivo_detalle) {
      toast.error('Debes seleccionar un motivo', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movementForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar movimiento');
      }

      toast.success(`✅ Movimiento de ${movementForm.tipo_movimiento} registrado correctamente`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      // Recargar datos
      await loadInitialData();
      handleCloseMovementModal();
    } catch (err) {
      console.error("Error registrando movimiento:", err);
      toast.error(`❌ ${err.message}`, {
        position: "top-right",
        autoClose: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMovementModal = useCallback((preselectedInsumo = null) => {
    if (preselectedInsumo) {
      setMovementForm({
        nombre_insumo: preselectedInsumo.nombre_insumo,
        cantidad_movida: "",
        tipo_movimiento: "entrada",
        motivo_detalle: "",
        observaciones: "",
        idSede: 1
      });
    }
    setShowMovementModal(true);
  }, []);

  const handleCloseMovementModal = useCallback(() => {
    setShowMovementModal(false);
    setMovementForm({
      nombre_insumo: "",
      cantidad_movida: "",
      tipo_movimiento: "entrada",
      motivo_detalle: "",
      observaciones: "",
      idSede: 1
    });
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setDetailModalData({
      title: "",
      items: [],
      isVencimiento: false
    });
  }, []);

  // ========================================
  // REFRESH MANUAL
  // ========================================

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadInitialData();
      toast.success('📊 Inventario actualizado correctamente', {
        position: "top-right",
        autoClose: 2000
      });
    } catch (error) {
      toast.error('Error al actualizar inventario', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadInitialData]);

  // ========================================
  // FILTRADO
  // ========================================

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = item.nombre_insumo
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "Todos" || item.estado === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inventoryItems, searchTerm, selectedStatus]);

  // ========================================
  // OPCIONES DE MOTIVOS
  // ========================================

  const motivosEntrada = [
    { value: "compra", label: "Compra a proveedor" },
    { value: "ajuste_conteo", label: "Ajuste de conteo (corrección)" }
  ];

  const motivosSalida = [
    { value: "venta/consumo", label: "Venta / Consumo en producción" },
    { value: "merma", label: "Merma" },
    { value: "desperdicio", label: "Desperdicio" },
    { value: "otros", label: "Otros" },
    { value: "ajuste_conteo", label: "Ajuste de conteo (corrección)" }
  ];

  const currentMotivos = movementForm.tipo_movimiento === "entrada" 
    ? motivosEntrada 
    : motivosSalida;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="inventory-crud">
      <ToastContainer limit={3} />

      {/* HEADER */}
      <div className="header-invent">
        <div className="header-title-invent">
          <h1>🍔 Gestión de Inventario</h1>
          <p>Control de Insumos y Materias Primas - Frank Furt</p>
        </div>
        <div className="header-actions-invent">
          {/* Botón para abrir modal de historial */}
          <button
            className="btn-secondary"
            onClick={() => setShowHistoryModal(true)}
            title="Ver Historial de Inventario"
          >
            <History size={20} /> Historial
          </button>
          <button 
            className="btn-refresh" 
            onClick={handleRefresh} 
            disabled={isLoading}
            title="Actualizar inventario"
          >
            <RefreshCw size={20} className={isLoading ? "spinning" : ""} />
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
          <button 
            className="btn-primary" 
            onClick={() => handleOpenMovementModal(null)}
            title="Registrar movimiento"
          >
            <Plus size={20} /> Registrar Movimiento
          </button>
        </div>
      </div>

      {/* STATS CARDS - INTERACTIVAS */}
      <div className="stats-container">
            <div 
              className="stat-card clickable" 
              onClick={() => handleStatsCardClick('all')}
              title="Ver todos los insumos"
            >
              <div className="stat-icon total">
                <Package size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.total_insumos}</h3>
                <p>Total Insumos</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => handleStatsCardClick('in-stock')}
              title="Ver insumos en buen estado"
            >
              <div className="stat-icon success">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.en_stock}</h3>
                <p>En Stock</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => handleStatsCardClick('low-stock')}
              title="Ver insumos que requieren atención"
            >
              <div className="stat-icon warning">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.requiere_atencion}</h3>
                <p>Requiere Atención</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => handleStatsCardClick('out-of-stock')}
              title="Ver insumos agotados"
            >
              <div className="stat-icon danger">
                <TrendingDown size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.agotado}</h3>
                <p>Agotados</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => handleStatsCardClick('proximos-vencer')}
              title="Ver productos próximos a vencer"
            >
              <div className="stat-icon info">
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.proximos_vencer}</h3>
                <p>Próximos a Vencer</p>
              </div>
            </div>
          </div>

          {/* FILTROS */}
          <div className="filters">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Buscar insumo..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Todos">Todos los Estados</option>
              <option value="En Stock">En Stock</option>
              <option value="Stock Bajo">Stock Bajo</option>
              <option value="Stock Crítico">Stock Crítico</option>
              <option value="Agotado">Agotado</option>
            </select>
          </div>

          {/* TABLA */}
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Nombre del Insumo</th>
                  <th>Unidad de Medida</th>
                  <th>Stock Disponible</th>
                  <th>Stock Mínimo</th>
                  <th>Fecha Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {isLoading 
                        ? "Cargando inventario..." 
                        : "No se encontraron insumos"}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <tr key={index}>
                      <td className="font-semibold">{item.nombre_insumo}</td>
                      <td>{item.unidad_medida}</td>
                      <td className="text-center font-bold">{item.stock_disponible}</td>
                      <td className="text-center">{item.stock_minimo_insumo}</td>
                      <td className="text-center">
                        {item.fecha_vencimiento ? (
                          <span className={`
                            ${item.dias_hasta_vencimiento !== null && item.dias_hasta_vencimiento <= 7 
                              ? 'text-danger font-bold' 
                              : item.dias_hasta_vencimiento !== null && item.dias_hasta_vencimiento <= 30 
                                ? 'text-warning' 
                                : ''}
                          `}>
                            {new Date(item.fecha_vencimiento).toLocaleDateString('es-CO')}
                            {item.dias_hasta_vencimiento !== null && (
                              <span className="dias-vencer">
                                {item.dias_hasta_vencimiento <= 0 
                                  ? ' (VENCIDO)' 
                                  : ` (${item.dias_hasta_vencimiento}d)`}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray">Sin fecha</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${item.estado.toLowerCase().replace(/\s+/g, "-")}`}>
                          {item.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-action btn-movement"
                          onClick={() => handleOpenMovementModal(item)}
                          title="Registrar movimiento"
                        >
                          <ArrowUpCircle size={16} />
                          Movimiento
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MODAL DE DETALLE (Stats Cards) */}
          {showDetailModal && (
            <div className="modal-overlay" onClick={handleCloseDetailModal}>
              <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-invent">
                  <h2>{detailModalData.title}</h2>
                  <button className="modal-close" onClick={handleCloseDetailModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body">
                  {detailModalData.items.length === 0 ? (
                    <p className="no-data">No hay insumos en esta categoría</p>
                  ) : (
                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th>Insumo</th>
                          <th>Unidad</th>
                          <th>Stock</th>
                          {detailModalData.isVencimiento ? (
                            <>
                              <th>Fecha Vencimiento</th>
                              <th>Días Restantes</th>
                              <th>Estado</th>
                            </>
                          ) : (
                            <>
                              <th>Mínimo</th>
                              <th>Estado</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {detailModalData.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.nombre_insumo}</td>
                            <td>{item.unidad_medida}</td>
                            <td className="font-bold">{item.stock_disponible}</td>
                            {detailModalData.isVencimiento ? (
                              <>
                                <td>
                                  {item.fecha_vencimiento 
                                    ? new Date(item.fecha_vencimiento).toLocaleDateString('es-CO')
                                    : 'Sin fecha'}
                                </td>
                                <td className={`font-bold ${
                                  item.dias_hasta_vencimiento <= 0 
                                    ? 'text-danger' 
                                    : item.dias_hasta_vencimiento <= 7 
                                      ? 'text-warning' 
                                      : ''
                                }`}>
                                  {item.dias_hasta_vencimiento <= 0 
                                    ? 'VENCIDO' 
                                    : `${item.dias_hasta_vencimiento} días`}
                                </td>
                                <td>
                                  <span className={`status-badge status-${
                                    item.estado_vencimiento 
                                      ? item.estado_vencimiento.toLowerCase().replace(/\s+/g, "-")
                                      : 'normal'
                                  }`}>
                                    {item.estado_vencimiento || 'Normal'}
                                  </span>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{item.stock_minimo_insumo}</td>
                                <td>
                                  <span className={`status-badge status-${item.estado.toLowerCase().replace(/\s+/g, "-")}`}>
                                    {item.estado}
                                  </span>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={handleCloseDetailModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE REGISTRO DE MOVIMIENTO */}
          {showMovementModal && (
            <div className="modal-overlay" onClick={handleCloseMovementModal}>
              <div className="modal modal-movement" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-invent">
                  <h2>📦 Registrar Movimiento de Inventario</h2>
                  <button className="modal-close" onClick={handleCloseMovementModal}>
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmitMovement} className="modal-form">
                  {/* Tipo de Movimiento */}
                  <div className="form-group full-width">
                    <label className="required">Tipo de Movimiento</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="tipo_movimiento"
                          value="entrada"
                          checked={movementForm.tipo_movimiento === "entrada"}
                          onChange={(e) => handleMovementFormChange("tipo_movimiento", e.target.value)}
                        />
                        <span className="radio-custom entrada">
                          <ArrowUpCircle size={20} />
                          Entrada
                        </span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="tipo_movimiento"
                          value="salida"
                          checked={movementForm.tipo_movimiento === "salida"}
                          onChange={(e) => handleMovementFormChange("tipo_movimiento", e.target.value)}
                        />
                        <span className="radio-custom salida">
                          <ArrowDownCircle size={20} />
                          Salida
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Selección de Insumo */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="required">Insumo</label>
                      <select
                        value={movementForm.nombre_insumo}
                        onChange={(e) => handleMovementFormChange("nombre_insumo", e.target.value)}
                        required
                      >
                        <option value="">Selecciona un insumo...</option>
                        {insumosList.map((insumo, index) => (
                          <option key={index} value={insumo.nombre_insumo}>
                            {insumo.nombre_insumo} ({insumo.unidad_medida}) - Stock: {insumo.stock_disponible}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="required">Cantidad</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Ej: 10"
                        value={movementForm.cantidad_movida}
                        onChange={(e) => handleMovementFormChange("cantidad_movida", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="form-group full-width">
                    <label className="required">Motivo del Movimiento</label>
                    <select
                      value={movementForm.motivo_detalle}
                      onChange={(e) => handleMovementFormChange("motivo_detalle", e.target.value)}
                      required
                    >
                      <option value="">Selecciona un motivo...</option>
                      {currentMotivos.map((motivo, index) => (
                        <option key={index} value={motivo.value}>
                          {motivo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Observaciones */}
                  <div className="form-group full-width">
                    <label>Observaciones (opcional)</label>
                    <textarea
                      rows="3"
                      placeholder="Ej: Compra a proveedor XYZ, factura #12345"
                      value={movementForm.observaciones}
                      onChange={(e) => handleMovementFormChange("observaciones", e.target.value)}
                    ></textarea>
                  </div>

                  {/* Acciones */}
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      onClick={handleCloseMovementModal} 
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Registrando..." : "Registrar Movimiento"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Historial de Inventario */}
          {showHistoryModal && (
            <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
              <div 
                className="modal-content modal-history-large" 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '95%', width: '1200px', maxHeight: '90vh', overflow: 'auto' }}
              >
                <button
                  className="modal-close"
                  onClick={() => setShowHistoryModal(false)}
                  aria-label="Cerrar modal"
                >
                  <X size={20} />
                </button>
                
                <div className="modal-header">
                  <History size={24} />
                  <h2>Historial de Movimientos de Inventario</h2>
                </div>

                {/* Renderizar el componente de historial dentro del modal */}
                <div className="modal-body-history">
                  <InventoryHistory />
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  export default InventoryCrud;