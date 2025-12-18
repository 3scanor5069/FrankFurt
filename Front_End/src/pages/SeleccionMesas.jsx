import React, { useState, useEffect } from 'react';
import MesaCard from '../components/MesaCard';
import { mesasAPI } from '../services/api.js';
import '../styles/SeleccionMesas.css';

const SeleccionMesas = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mesasAPI.obtenerMesas();
      setMesas(response.data);
    } catch (err) {
      setError('Error cargando las mesas. Por favor, intenta nuevamente.');
      console.error('Error cargando mesas:', err);
    } finally {
      setLoading(false);
    }
  };

  const activarMesa = async (mesaId) => {
    try {
      const response = await mesasAPI.activarMesa(mesaId);
      
      // Actualizar el estado local de la mesa
      setMesas(prevMesas => 
        prevMesas.map(mesa => 
          mesa.id === mesaId 
            ? { ...mesa, estado: 'ocupada' }
            : mesa
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Error activando mesa:', err);
      throw err;
    }
  };

  const mesasFiltradas = mesas.filter(mesa => {
    if (filtroEstado === 'todas') return true;
    return mesa.estado === filtroEstado;
  });

  const contarMesasPorEstado = (estado) => {
    return mesas.filter(mesa => mesa.estado === estado).length;
  };

  if (loading) {
    return (
      <div className="seleccion-mesas">
        <div className="loading">Cargando mesas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seleccion-mesas">
        <div className="error-message">
          {error}
          <button className="btn btn-primary" onClick={cargarMesas} style={{ marginLeft: '10px' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seleccion-mesas">
      <div className="page-header">
        <h1 className="page-title">Selección de Mesas</h1>
        <p className="page-subtitle">
          Selecciona una mesa para comenzar a tomar un pedido
        </p>
      </div>

      <div className="estadisticas">
        <div className="stat-card">
          <div className="stat-number">{contarMesasPorEstado('disponible')}</div>
          <div className="stat-label">Disponibles</div>
        </div>
        <div className="stat-card ocupada">
          <div className="stat-number">{contarMesasPorEstado('ocupada')}</div>
          <div className="stat-label">Ocupadas</div>
        </div>
        <div className="stat-card esperando">
          <div className="stat-number">{contarMesasPorEstado('esperando_pago')}</div>
          <div className="stat-label">Esperando Pago</div>
        </div>
      </div>

      <div className="filtros">
        <button 
          className={`filtro-btn ${filtroEstado === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('todas')}
        >
          Todas ({mesas.length})
        </button>
        <button 
          className={`filtro-btn ${filtroEstado === 'disponible' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('disponible')}
        >
          Disponibles ({contarMesasPorEstado('disponible')})
        </button>
        <button 
          className={`filtro-btn ${filtroEstado === 'ocupada' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('ocupada')}
        >
          Ocupadas ({contarMesasPorEstado('ocupada')})
        </button>
        <button 
          className={`filtro-btn ${filtroEstado === 'esperando_pago' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('esperando_pago')}
        >
          Esperando Pago ({contarMesasPorEstado('esperando_pago')})
        </button>
      </div>

      <div className="mesas-grid">
        {mesasFiltradas.length === 0 ? (
          <div className="no-mesas">
            <div className="no-mesas-icon">🍽️</div>
            <h3>No hay mesas {filtroEstado === 'todas' ? '' : `en estado "${filtroEstado}"`}</h3>
            <p>
              {filtroEstado === 'todas' 
                ? 'No se encontraron mesas en el sistema.'
                : `Selecciona otro filtro para ver más mesas.`
              }
            </p>
            {filtroEstado !== 'todas' && (
              <button 
                className="btn btn-primary"
                onClick={() => setFiltroEstado('todas')}
              >
                Ver Todas las Mesas
              </button>
            )}
          </div>
        ) : (
          mesasFiltradas.map(mesa => (
            <MesaCard
              key={mesa.id}
              mesa={mesa}
              onActivarMesa={activarMesa}
            />
          ))
        )}
      </div>

      <div className="refresh-section">
        <button 
          className="btn btn-secondary refresh-btn"
          onClick={cargarMesas}
        >
          🔄 Actualizar Mesas
        </button>
      </div>
    </div>
  );
};

export default SeleccionMesas;