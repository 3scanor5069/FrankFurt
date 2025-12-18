// src/components/Hero.js
import React from 'react';
import '../styles/Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🍔 Fast Food Premium</span>
          </div>
          
          <h1 className="hero-title">
            Somos <span className="brand-highlight">Frank Furt</span>
          </h1>
          
          <p className="hero-description">
            Disfruta de las mejores comidas con los mejores precios. 
            Lo más importante: <strong>tú decides qué comer</strong>
          </p>
          
          <div className="hero-actions">
            <button className="hero-btn primary">
              <span>Ordenar Ahora</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <button className="hero-btn secondary">
              Ver Menú
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;