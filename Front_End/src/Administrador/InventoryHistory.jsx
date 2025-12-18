import React, { useState, useEffect } from 'react';
import './InventoryHistory.css';

// Define la URL base de la API a partir de una variable de entorno.
// Cuando se despliegue en producción, establece REACT_APP_API_URL en el archivo .env correspondiente.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';

const InventoryHistory = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroMotivo, setFiltroMotivo] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [resumen, setResumen] = useState(null);

  // Cargar historial y resumen al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar historial y resumen en paralelo
      const [historialResponse, resumenResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/inventoryHistory/`),
        fetch(`${API_BASE_URL}/api/inventoryHistory/resumen`)
      ]);
      
      if (!historialResponse.ok) {
        throw new Error('Error al cargar el historial');
      }
      
      const historialData = await historialResponse.json();
      
      if (historialData.success) {
        setHistorial(historialData.data || []);
      } else {
        setError(historialData.error || 'Error al cargar el historial');
      }

      // Cargar resumen si la respuesta es exitosa
      if (resumenResponse.ok) {
        const resumenData = await resumenResponse.json();
        if (resumenData.success) {
          setResumen(resumenData.data);
        }
      }

    } catch (err) {
      console.error('Error:', err);
      setError('Error al conectar con el servidor. Verifica que el backend esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar historial según los criterios
  const historialFiltrado = historial.filter(movimiento => {
    const cumpleTipo = filtroTipo === 'todos' || movimiento.tipo === filtroTipo;
    const cumpleMotivo = filtroMotivo === 'todos' || movimiento.motivo === filtroMotivo;
    const cumpleFecha = !filtroFecha || movimiento.fecha.startsWith(filtroFecha);
    const cumpleProducto = !busquedaProducto || 
      movimiento.nombreProducto.toLowerCase().includes(busquedaProducto.toLowerCase());
    
    return cumpleTipo && cumpleMotivo && cumpleFecha && cumpleProducto;
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMotivo = (motivo) => {
    const motivos = {
      'compra': 'Compra',
      'venta/consumo': 'Venta/Consumo',
      'merma/desperdicio': 'Merma/Desperdicio',
      'ajuste_conteo': 'Ajuste de Conteo',
      'desperdicio': 'Desperdicio'
    };
    return motivos[motivo] || motivo;
  };

  const obtenerClaseTipo = (tipo) => {
    return tipo === 'entrada' ? 'tipo-entrada' : 'tipo-salida';
  };

  const obtenerIconoTipo = (tipo) => {
    return tipo === 'entrada' ? '↑' : '↓';
  };

  const limpiarFiltros = () => {
    setFiltroTipo('todos');
    setFiltroMotivo('todos');
    setFiltroFecha('');
    setBusquedaProducto('');
  };

  if (loading) {
    return (
      <div className="inventory-history-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando historial de inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-history-container">
      <div className="inventory-history-header">
        <h1>Historial de Movimientos de Inventario</h1>
        <p>Registro completo de entradas y salidas de insumos</p>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={cargarDatos} className="btn-retry">
            Reintentar
          </button>
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="filtro-tipo">Tipo de Movimiento:</label>
          <select
            id="filtro-tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filtro-motivo">Motivo:</label>
          <select
            id="filtro-motivo"
            value={filtroMotivo}
            onChange={(e) => setFiltroMotivo(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="compra">Compra</option>
            <option value="venta/consumo">Venta/Consumo</option>
            <option value="merma/desperdicio">Merma/Desperdicio</option>
            <option value="ajuste_conteo">Ajuste de Conteo</option>
            <option value="desperdicio">Desperdicio</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filtro-fecha">Fecha:</label>
          <input
            type="date"
            id="filtro-fecha"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="busqueda-producto">Buscar Insumo:</label>
          <input
            type="text"
            id="busqueda-producto"
            placeholder="Nombre del insumo..."
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
          />
        </div>

        <button 
          className="btn-limpiar-filtros"
          onClick={limpiarFiltros}
        >
          Limpiar Filtros
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card entradas">
          <div className="card-icon">↑</div>
          <div className="card-content">
            <h3>Total Entradas</h3>
            <p>{historialFiltrado.filter(m => m.tipo === 'entrada').length}</p>
            {resumen && (
              <small>Cantidad: {parseFloat(resumen.cantidad_total_entradas || 0).toFixed(2)}</small>
            )}
          </div>
        </div>
        
        <div className="summary-card salidas">
          <div className="card-icon">↓</div>
          <div className="card-content">
            <h3>Total Salidas</h3>
            <p>{historialFiltrado.filter(m => m.tipo === 'salida').length}</p>
            {resumen && (
              <small>Cantidad: {parseFloat(resumen.cantidad_total_salidas || 0).toFixed(2)}</small>
            )}
          </div>
        </div>
        
        <div className="summary-card total">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Total Movimientos</h3>
            <p>{historialFiltrado.length}</p>
            {resumen && (
              <small>Global: {resumen.total_movimientos || 0}</small>
            )}
          </div>
        </div>
      </div>

      <div className="table-container">
        {historialFiltrado.length === 0 ? (
          <div className="no-data">
            <p>📭 No se encontraron movimientos con los filtros aplicados</p>
            <button onClick={limpiarFiltros} className="btn-limpiar-filtros">
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Insumo</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Cantidad</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {historialFiltrado.map((movimiento) => (
                <tr key={movimiento.idMovimiento} className={obtenerClaseTipo(movimiento.tipo)}>
                  <td className="fecha-cell">
                    {formatearFecha(movimiento.fecha)}
                  </td>
                  <td className="producto-cell">
                    <strong>{movimiento.nombreProducto}</strong>
                  </td>
                  <td className="tipo-cell">
                    <span className={`tipo-badge ${obtenerClaseTipo(movimiento.tipo)}`}>
                      {obtenerIconoTipo(movimiento.tipo)} {movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}
                    </span>
                  </td>
                  <td className="motivo-cell">
                    <span className="motivo-text">
                      {formatearMotivo(movimiento.motivo)}
                    </span>
                  </td>
                  <td className="cantidad-cell">
                    <span className={`cantidad ${obtenerClaseTipo(movimiento.tipo)}`}>
                      {movimiento.tipo === 'entrada' ? '+' : '-'}
                      {parseFloat(movimiento.cantidad).toFixed(2)}
                    </span>
                  </td>
                  <td className="observaciones-cell">
                    <span className="observaciones-text" title={movimiento.observaciones}>
                      {movimiento.observaciones || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-footer">
        <p>
          Mostrando {historialFiltrado.length} de {historial.length} movimientos
        </p>
        <button onClick={cargarDatos} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
};

export default InventoryHistory;