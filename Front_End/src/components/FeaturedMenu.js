// src/components/FeaturedMenu.js
import React, { useState, useEffect } from 'react';
import '../styles/FeaturedMenu.css';

// Construye la URL base para la API usando la variable de entorno REACT_APP_API_URL.
// Si no existe, se asume que el backend corre en localhost:3006.
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3006'}/api`;

const FeaturedMenu = () => {
  const [specialItems, setSpecialItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpecialItems();
  }, []);

  const fetchSpecialItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/menu/especiales`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los especiales del día');
      }
      
      const data = await response.json();
      setSpecialItems(data);
    } catch (err) {
      console.error('Error cargando especiales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <section className="featured-menu">
        <h2>Especiales del Día</h2>
        <div className="loading-message">Cargando especiales...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-menu">
        <h2>Especiales del Día</h2>
        <div className="error-message">Error al cargar los especiales: {error}</div>
      </section>
    );
  }

  if (specialItems.length === 0) {
    return (
      <section className="featured-menu">
        <h2>Especiales del Día</h2>
        <div className="no-specials-message">
          <p>Hoy no hay especiales disponibles. ¡Revisa nuestro menú completo!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-menu">
      <h2>Especiales del Día</h2>
      <p className="featured-subtitle">Descubre nuestras ofertas especiales de hoy</p>
      <div className="menu-grid">
        {specialItems.map((item) => (
          <div className="menu-card" key={item.id}>
            {item.image ? (
              <img src={item.image} alt={item.name} />
            ) : (
              <div className="placeholder-image">
                <span>🍽️</span>
              </div>
            )}
            <div className="menu-info">
              <div className="special-badge">Especial del día</div>
              <h3>{item.name}</h3>
              <p>{item.description || 'Delicioso platillo especial'}</p>
              <span className="price">{formatPrice(item.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedMenu;