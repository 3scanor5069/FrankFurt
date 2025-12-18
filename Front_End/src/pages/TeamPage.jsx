import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/TeamPage.css';

const TeamPage = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: 'Hans Müller',
      role: 'Chef Principal & Fundador',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '25 años',
      specialty: 'Cocina Tradicional Alemana',
      description: 'Hans es el corazón culinario de Frank Furt. Nacido en Múnich, aprendió las técnicas tradicionales alemanas de su abuela. Su pasión por la gastronomía lo llevó a trabajar en los mejores restaurantes de Alemania antes de venir a Colombia.',
      achievements: [
        'Certificado en Cocina Tradicional Bávara',
        'Ganador del premio "Mejor Chef Alemán" en Colombia 2020',
        'Autor del libro "Sabores de Alemania"'
      ],
      email: 'hans@frankfurt.com.co',
      phone: '+57 1 234 5678'
    },
    {
      id: 2,
      name: 'María Müller',
      role: 'Gerente General & Co-fundadora',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c88f9b6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '20 años',
      specialty: 'Administración y Servicio al Cliente',
      description: 'María es la fuerza organizacional detrás de Frank Furt. Con formación en administración hotelera y un corazón colombiano, se encarga de que cada experiencia en el restaurante sea excepcional.',
      achievements: [
        'MBA en Administración Hotelera',
        'Certificada en Servicio al Cliente Internacional',
        'Fundadora de la Asociación de Restaurantes Alemanes en Colombia'
      ],
      email: 'maria@frankfurt.com.co',
      phone: '+57 1 234 5679'
    },
    {
      id: 3,
      name: 'Klaus Weber',
      role: 'Sous Chef',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '15 años',
      specialty: 'Panadería y Repostería Alemana',
      description: 'Klaus es nuestro maestro panadero. Especializado en panes y postres tradicionales alemanes, aporta innovación mientras mantiene la autenticidad de cada receta ancestral.',
      achievements: [
        'Maestro Panadero Certificado en Düsseldorf',
        'Especialista en Pretzel Tradicional',
        'Ganador del concurso "Mejor Strudel" 2019'
      ],
      email: 'klaus@frankfurt.com.co',
      phone: '+57 1 234 5680'
    },
    {
      id: 4,
      name: 'Andrea Schneider',
      role: 'Chef de Cocina Fría',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '12 años',
      specialty: 'Embutidos y Conservas',
      description: 'Andrea es nuestra especialista en embutidos artesanales y conservas. Su expertise en la preparación de salchichas y productos curados garantiza la calidad auténtica de nuestros platillos.',
      achievements: [
        'Certificada en Elaboración de Embutidos Tradicionales',
        'Especialista en Chucrut y Fermentados',
        'Formación en Carnicería Artesanal'
      ],
      email: 'andrea@frankfurt.com.co',
      phone: '+57 1 234 5681'
    },
    {
      id: 5,
      name: 'Thomas Fischer',
      role: 'Sommelier',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '18 años',
      specialty: 'Cervezas Alemanas y Maridajes',
      description: 'Thomas es nuestro experto en cervezas alemanas. Con una colección de más de 200 variedades, se encarga de crear los maridajes perfectos para cada plato de nuestro menú.',
      achievements: [
        'Sommelier Certificado en Cervezas Alemanas',
        'Juez Internacional de Cervezas',
        'Creador de 15 maridajes únicos'
      ],
      email: 'thomas@frankfurt.com.co',
      phone: '+57 1 234 5682'
    },
    {
      id: 6,
      name: 'Isabella Rodriguez',
      role: 'Jefe de Servicio',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '10 años',
      specialty: 'Protocolo y Atención al Cliente',
      description: 'Isabella lidera nuestro equipo de servicio con calidez y profesionalismo. Su experiencia en hotelería de lujo asegura que cada comensal reciba un trato excepcional.',
      achievements: [
        'Certificada en Protocolo Internacional',
        'Especialista en Servicio de Mesa Europea',
        'Líder del Año en Servicio al Cliente 2021'
      ],
      email: 'isabella@frankfurt.com.co',
      phone: '+57 1 234 5683'
    }
  ];

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  return (
    <div id="team-wrapper">
      <Header />
      <main id="team-content">
        {/* Hero Section */}
        <section id="team-hero">
          <div className="hero-overlay">
            <h1 className="hero-title">Nuestro Equipo</h1>
            <p className="hero-subtitle">Los artistas detrás de cada experiencia culinaria</p>
          </div>
        </section>

        {/* Team Grid */}
        <section id="team-grid-section">
          <div className="container">
            <h2 className="section-title">Conoce a Nuestro Equipo</h2>
            <div className="team-grid">
              {teamMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="team-card"
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="card-image">
                    <img src={member.image} alt={member.name} />
                    <div className="card-overlay">
                      <span className="view-more">Ver más</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <h3 className="member-name">{member.name}</h3>
                    <p className="member-role">{member.role}</p>
                    <div className="member-stats">
                      <span className="stat">
                        <strong>Experiencia:</strong> {member.experience}
                      </span>
                      <span className="stat">
                        <strong>Especialidad:</strong> {member.specialty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Values */}
        <section id="team-values">
          <div className="container">
            <h2 className="section-title">Lo que nos une</h2>
            <div className="values-grid">
              <div className="value-item">
                <div className="value-icon">🤝</div>
                <h3>Trabajo en Equipo</h3>
                <p>Cada miembro es fundamental para crear la experiencia Frank Furt</p>
              </div>
              <div className="value-item">
                <div className="value-icon">⭐</div>
                <h3>Excelencia</h3>
                <p>Nos esforzamos por superar las expectativas en cada detalle</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🎯</div>
                <h3>Pasión</h3>
                <p>Amamos lo que hacemos y se refleja en cada plato que servimos</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🌟</div>
                <h3>Innovación</h3>
                <p>Respetamos la tradición mientras exploramos nuevas posibilidades</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <img src={selectedMember.image} alt={selectedMember.name} />
              <div className="modal-info">
                <h2>{selectedMember.name}</h2>
                <p className="modal-role">{selectedMember.role}</p>
                <div className="modal-stats">
                  <span><strong>Experiencia:</strong> {selectedMember.experience}</span>
                  <span><strong>Especialidad:</strong> {selectedMember.specialty}</span>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <p className="modal-description">{selectedMember.description}</p>
              <div className="modal-achievements">
                <h4>Logros y Certificaciones:</h4>
                <ul>
                  {selectedMember.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-contact">
                <h4>Contacto:</h4>
                <p>📧 {selectedMember.email}</p>
                <p>📞 {selectedMember.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TeamPage;