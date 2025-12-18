import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ServicesPage.css';

const ServicesPage = () => {
  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      id: 1,
      title: 'Restaurante',
      icon: '🍽️',
      shortDesc: 'Experiencia gastronómica auténtica alemana',
      fullDesc: 'Sumérgete en la auténtica experiencia culinaria alemana en nuestro acogedor restaurante. Ofrecemos un ambiente tradicional con música alemana suave, decoración típica bávara y el mejor servicio personalizado.',
      features: [
        'Menú tradicional alemán con más de 50 platos',
        'Ambiente típico bávaro con música en vivo los fines de semana',
        'Servicio personalizado por nuestro equipo especializado',
        'Horarios extendidos de 12:00 PM a 11:00 PM',
        'Reservas disponibles para grupos grandes'
      ],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      title: 'Catering',
      icon: '🚚',
      shortDesc: 'Lleva el sabor alemán a tu evento',
      fullDesc: 'Nuestro servicio de catering lleva la experiencia Frank Furt directamente a tu evento. Perfecto para celebraciones corporativas, bodas, cumpleaños o cualquier ocasión especial.',
      features: [
        'Menús personalizados según el tipo de evento',
        'Servicio completo con meseros especializados',
        'Equipamiento completo (platos, cubiertos, manteles)',
        'Montaje y desmontaje incluido',
        'Cobertura en toda Bogotá y municipios cercanos'
      ],
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      price: 'Desde $35.000 por persona (mínimo 20 personas)'
    },
    {
      id: 3,
      title: 'Eventos Privados',
      icon: '🎉',
      shortDesc: 'Celebra en nuestro espacio exclusivo',
      fullDesc: 'Reserva nuestro restaurante completo o nuestro salón privado para tu evento especial. Ofrecemos un ambiente íntimo y exclusivo con servicio personalizado.',
      features: [
        'Salón privado con capacidad para 80 personas',
        'Reserva completa del restaurante para hasta 150 personas',
        'Menús especiales para eventos',
        'Decoración temática alemana incluida',
        'Sistema de sonido y micrófono disponible'
      ],
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      price: 'Desde $45.000 por persona'
    },
    {
      id: 4,
      title: 'Clases de Cocina',
      icon: '👨‍🍳',
      shortDesc: 'Aprende a cocinar auténticos platos alemanes',
      fullDesc: 'Únete a nuestras clases magistrales de cocina alemana dirigidas por el Chef Hans. Aprende técnicas tradicionales y secretos familiares en un ambiente divertido y educativo.',
      features: [
        'Clases grupales los sábados (máximo 12 personas)',
        'Clases privadas disponibles entre semana',
        'Incluye ingredientes y recetario digital',
        'Degustación de lo preparado',
        'Certificado de participación'
      ],
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      price: 'Desde $85.000 por persona'
    },
    {
      id: 5,
      title: 'Delivery & Takeaway',
      icon: '🛵',
      shortDesc: 'Disfruta Frank Furt en casa',
      fullDesc: 'Lleva la experiencia Frank Furt a tu hogar u oficina. Nuestro servicio de entrega garantiza que los platos lleguen frescos y mantengan toda su calidad.',
      features: [
        'Entrega gratuita en pedidos superiores a $50.000',
        'Tiempo de entrega: 30-45 minutos',
        'Empaque ecológico que mantiene la temperatura',
        'Cobertura en toda Bogotá',
        'Pedidos online y por WhatsApp'
      ],
      image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      price: 'Domicilio: $4.000 (Gratis en pedidos +$50.000)'
    },
    {
      id: 6,
      title: 'Degustaciones',
      icon: '🍷',
      shortDesc: 'Experiencias gastronómicas únicas',
      fullDesc: 'Participa en nuestras degustaciones temáticas donde exploramos diferentes regiones de Alemania a través de sus sabores, maridadas con las mejores cervezas alemanas.',
      features: [
        'Degustaciones temáticas mensuales',
        'Maridajes con cervezas alemanas premium',
        'Presentación cultural de cada región',
        'Grupos reducidos (máximo 25 personas)',
        'Certificado de sommelier de cerveza básico'
      ],
      image: 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      price: 'Desde $65.000 por persona'
    }
  ];

  return (
    <div id="services-wrapper">
      <Header />
      <main id="services-content">
        {/* Hero Section */}
        <section id="services-hero">
          <div className="hero-overlay">
            <h1 className="hero-title">Nuestros Servicios</h1>
            <p className="hero-subtitle">Experiencias gastronómicas alemanas para cada ocasión</p>
          </div>
        </section>

        {/* Services Overview */}
        <section id="services-overview">
          <div className="container">
            <h2 className="section-title">¿Qué ofrecemos?</h2>
            <div className="services-grid">
              {services.map((service, index) => (
                <div 
                  key={service.id} 
                  className={`service-card ${activeService === index ? 'active' : ''}`}
                  onClick={() => setActiveService(index)}
                >
                  <div className="service-icon">{service.icon}</div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-short-desc">{service.shortDesc}</p>
                  <button className="service-btn">Ver detalles</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Detail */}
        <section id="service-detail">
          <div className="container">
            <div className="detail-content">
              <div className="detail-image">
                <img 
                  src={services[activeService].image} 
                  alt={services[activeService].title}
                />
              </div>
              <div className="detail-info">
                <div className="detail-header">
                  <span className="detail-icon">{services[activeService].icon}</span>
                  <h2 className="detail-title">{services[activeService].title}</h2>
                </div>
                <p className="detail-description">
                  {services[activeService].fullDesc}
                </p>
                <div className="detail-features">
                  <h4>¿Qué incluye?</h4>
                  <ul>
                    {services[activeService].features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
               
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section id="services-cta">
          <div className="container">
            <div className="cta-content">
              <h2>¿Listo para vivir la experiencia Frank Furt?</h2>
              <p>Contáctanos y permítenos hacer de tu evento algo inolvidable</p>
              <div className="cta-contact">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <strong>Llámanos</strong>
                    <p>+57 1 234 5678</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <strong>Escríbenos</strong>
                    <p>servicios@frankfurt.com.co</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">💬</span>
                  <div>
                    <strong>WhatsApp</strong>
                    <p>+57 300 123 4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;