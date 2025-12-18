import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/AboutPage.css';

const AboutPage = () => {
  return (
    <div id="about-wrapper">
      <Header />
      <main id="about-content">
        {/* Hero Section */}
        <section id="about-hero">
          <div className="hero-overlay">
            <h1 className="hero-title">Frank Furt</h1>
            <p className="hero-subtitle">Tradición alemana en cada bocado</p>
          </div>
        </section>

        {/* Story Section */}
        <section id="about-story">
          <div className="container">
            <h2 className="section-title">Nuestra Historia</h2>
            <div className="story-content">
              <div className="story-text">
                <p>
                  Fundado en 2015 por Hans y María Müller, Frank Furt nació del sueño de traer 
                  la auténtica experiencia culinaria alemana a Colombia. Con más de 20 años de 
                  experiencia en la gastronomía europea, Hans decidió compartir las recetas 
                  familiares que habían pasado de generación en generación.
                </p>
                <p>
                  Nuestro restaurante se ha convertido en un punto de encuentro para los amantes 
                  de la cocina alemana, ofreciendo desde las tradicionales salchichas bratwurst 
                  hasta los más exquisitos platos de la región de Baviera, todo preparado con 
                  ingredientes frescos y técnicas tradicionales.
                </p>
              </div>
              <div className="story-image">
                <img 
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                  alt="Interior del restaurante Frank Furt"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section id="about-values">
          <div className="container">
            <h2 className="section-title">Nuestros Valores</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🍺</div>
                <h3>Tradición</h3>
                <p>Mantenemos vivas las recetas tradicionales alemanas transmitidas por generaciones.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🥨</div>
                <h3>Calidad</h3>
                <p>Utilizamos solo los mejores ingredientes, muchos importados directamente de Alemania.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">❤️</div>
                <h3>Familia</h3>
                <p>Creamos un ambiente cálido donde cada cliente se siente como en casa.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🌍</div>
                <h3>Comunidad</h3>
                <p>Somos parte activa de nuestra comunidad, apoyando eventos locales y culturales.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="about-mission">
          <div className="container">
            <div className="mission-content">
              <h2 className="section-title">Nuestra Misión</h2>
              <p className="mission-text">
                En Frank Furt, nuestra misión es ser embajadores de la rica cultura gastronómica alemana, 
                ofreciendo experiencias culinarias auténticas que conecten a las personas con la tradición, 
                la calidad y el sabor genuino de Alemania, todo en un ambiente familiar y acogedor en el 
                corazón de Colombia.
              </p>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section id="about-location">
          <div className="container">
            <h2 className="section-title">Visítanos</h2>
            <div className="location-content">
              <div className="location-info">
                <h3>📍 Ubicación</h3>
                <p>Carrera 15 #85-32<br/>Zona Rosa, Bogotá</p>
                
                <h3>🕒 Horarios</h3>
                <p>
                  Lunes a Jueves: 12:00 PM - 10:00 PM<br/>
                  Viernes a Sábado: 12:00 PM - 11:00 PM<br/>
                  Domingo: 1:00 PM - 9:00 PM
                </p>
                
                <h3>📞 Contacto</h3>
                <p>
                  Teléfono: +57 1 234 5678<br/>
                  Email: info@frankfurt.com.co
                </p>
              </div>
              <div className="location-image">
                <img 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Ubicación del restaurante"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;