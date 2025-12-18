// src/components/PromoCarousel.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles/PromoCarousel.css';

const slides = [
  {
    id: 1,
    text: '🔥 2x1 en todas las hamburguesas los viernes',
    image: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/hamburger-1238246_1280.jpg',
  },
  {
    id: 2,
    text: '🍕 Envío gratis en pedidos mayores a $20',
    image: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg',
  },
  {
    id: 3,
    text: '🥗 Nueva línea saludable: ensaladas frescas',
    image: 'https://comedera.com/wp-content/uploads/sites/9/2024/10/ensalada-mediterranea-de-tomate-aceitunas-y-queso-feta.jpg',
  },
  {
    id: 4,
    text: '🍔 Combo familiar: 4 hamburguesas + papas + refrescos',
    image: 'https://media.istockphoto.com/id/600056274/es/foto/comida-r%C3%A1pida-para-llevar-hamburguesa-cola-y-patatas-fritas-sobre-madera.jpg?s=612x612&w=0&k=20&c=-SOnUc2j1QymeK_z07d_xuTtg9Xf-3ikRzn5pLwtWF0=',
  },
  {
    id: 5,
    text: '🍦 Postre gratis con tu pedido de $30 o más',
    image: 'https://www.paulinacocina.net/wp-content/uploads/2024/01/receta-de-postre-de-maracuya-Paulina-Cocina-Recetas-1722251880-1200x676.jpg',
  },
];

const PromoCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying]);

  const goToSlide = (index) => {
    if (isTransitioning || index === current) return;
    
    setIsTransitioning(true);
    setCurrent(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    const prevIndex = (current - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    const nextIndex = (current + 1) % slides.length;
    goToSlide(nextIndex);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleImageError = (slideId) => {
    setImageErrors(prev => ({ ...prev, [slideId]: true }));
  };

  const handleImageLoad = (slideId) => {
    setImageErrors(prev => ({ ...prev, [slideId]: false }));
  };

  const handleMouseEnter = () => {
    setIsPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsPlaying(true);
  };

  return (
    <div 
      className="carousel-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Navigation Arrows */}
      <button 
        className="carousel-arrow carousel-arrow-left"
        onClick={goToPrevious}
        disabled={isTransitioning}
        aria-label="Slide anterior"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>

      <button 
        className="carousel-arrow carousel-arrow-right"
        onClick={goToNext}
        disabled={isTransitioning}
        aria-label="Siguiente slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>

      {/* Main Carousel */}
      <div className="carousel-wrapper">
        <div 
          className="carousel-track"
          style={{ 
            transform: `translateX(-${current * (100 / slides.length)}%)`,
            width: `${slides.length * 100}%`
          }}
        >
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`carousel-slide ${index === current ? 'active' : ''}`}
              style={{ width: `${100 / slides.length}%` }}
            >
              {imageErrors[slide.id] ? (
                <div className="slide-image-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🖼️</div>
                    <p>Imagen no disponible</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={slide.image} 
                  alt={`Promoción ${slide.id}`}
                  className="slide-image"
                  onError={() => handleImageError(slide.id)}
                  onLoad={() => handleImageLoad(slide.id)}
                  loading="lazy"
                />
              )}
              
              <div className="slide-overlay">
                <div className="slide-content">
                  <p className="slide-text">{slide.text}</p>
                  <button className="slide-cta">Ver más</button>
                </div>
              </div>

              {/* Progress bar for current slide */}
              {index === current && isPlaying && (
                <div className="slide-progress">
                  <div className="slide-progress-bar"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="carousel-controls">
        {/* Indicators */}
        <div className="carousel-indicators">
          {slides.map((slide, index) => (
            <button
              key={index}
              className={`indicator ${index === current ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              aria-label={`Ir a slide ${index + 1}`}
            >
              <span className="indicator-progress"></span>
            </button>
          ))}
        </div>

        {/* Play/Pause Button */}
        <button 
          className="play-pause-button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pausar carrusel' : 'Reproducir carrusel'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
          )}
        </button>
      </div>

      {/* Slide Counter */}
      <div className="slide-counter">
        <span>{current + 1}</span>
        <span className="counter-separator">/</span>
        <span>{slides.length}</span>
      </div>
    </div>
  );
};

export default PromoCarousel;