import React, { useState } from 'react';
import '../styles/ProductoCard.css';

const ProductoCard = ({ producto, onAgregar }) => {
  const [cantidad, setCantidad] = useState(1);

  const handleAgregar = () => {
    onAgregar({
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      cantidad: cantidad,
      precio_unitario: producto.precio
    });
    setCantidad(1);
  };

  const incrementar = () => {
    setCantidad(prev => prev + 1);
  };

  const decrementar = () => {
    setCantidad(prev => prev > 1 ? prev - 1 : 1);
  };

  const getEmojiCategoria = (categoria) => {
    switch (categoria.toLowerCase()) {
      case 'principales':
        return '🌭';
      case 'acompañantes':
        return '🍟';
      case 'bebidas':
        return '🍺';
      case 'postres':
        return '🧁';
      default:
        return '🍽️';
    }
  };

  return (
    <div className="producto-card">
      <div className="producto-header">
        <div className="producto-emoji">
          {getEmojiCategoria(producto.categoria)}
        </div>
        <span className="producto-categoria">{producto.categoria}</span>
      </div>
      
      <div className="producto-info">
        <h4 className="producto-nombre">{producto.nombre}</h4>
        <p className="producto-descripcion">{producto.descripcion}</p>
        <div className="producto-precio">
          ${producto.precio.toFixed(2)}
        </div>
      </div>

      <div className="producto-actions">
        <div className="cantidad-selector">
          <button 
            className="cantidad-btn" 
            onClick={decrementar}
            type="button"
          >
            -
          </button>
          <span className="cantidad-display">{cantidad}</span>
          <button 
            className="cantidad-btn" 
            onClick={incrementar}
            type="button"
          >
            +
          </button>
        </div>
        
        <button 
          className="btn btn-primary agregar-btn"
          onClick={handleAgregar}
          type="button"
        >
          Agregar ${(producto.precio * cantidad).toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default ProductoCard;