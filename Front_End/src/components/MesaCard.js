import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MesaCard.css';

const MesaCard = ({ mesa, onActivarMesa }) => {
  const navigate = useNavigate();

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'estado-disponible';
      case 'ocupada':
        return 'estado-ocupada';
      case 'esperando_pago':
        return 'estado-esperando-pago';
      default:
        return '';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'Disponible';
      case 'ocupada':
        return 'Ocupada';
      case 'esperando_pago':
        return 'Esperando Pago';
      default:
        return estado;
    }
  };

  const handleClick = async () => {
    if (mesa.estado === 'disponible') {
      try {
        await onActivarMesa(mesa.id);
        navigate(`/mesa/${mesa.id}/orden`);
      } catch (error) {
        console.error('Error activando mesa:', error);
      }
    } else if (mesa.estado === 'ocupada') {
      navigate(`/mesa/${mesa.id}/orden`);
    }
  };

  const isClickable = mesa.estado === 'disponible' || mesa.estado === 'ocupada';

  return (
    <div 
      className={`mesa-card ${mesa.estado} ${isClickable ? 'clickable' : ''}`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="mesa-header">
        <h3 className="mesa-numero">Mesa {mesa.numero}</h3>
        <span className={`mesa-estado ${getEstadoClass(mesa.estado)}`}>
          {getEstadoText(mesa.estado)}
        </span>
      </div>
      
      <div className="mesa-info">
        <div className="capacidad">
          <span className="capacidad-icon">👥</span>
          <span>Capacidad: {mesa.capacidad} personas</span>
        </div>
      </div>

      <div className="mesa-visual">
        <div className="mesa-icon">
          🍽️
        </div>
        {Array.from({ length: mesa.capacidad }, (_, i) => (
          <div key={i} className="silla-icon">💺</div>
        ))}
      </div>

      <div className="mesa-actions">
        {mesa.estado === 'disponible' && (
          <button className="btn btn-primary">
            Activar Mesa
          </button>
        )}
        {mesa.estado === 'ocupada' && (
          <button className="btn btn-secondary">
            Ver Orden
          </button>
        )}
        {mesa.estado === 'esperando_pago' && (
          <button className="btn btn-disabled" disabled>
            Procesando Pago
          </button>
        )}
      </div>
    </div>
  );
};

export default MesaCard;