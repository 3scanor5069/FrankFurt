// src/components/Testimonials.js
import React from 'react';
import '../styles/Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: 'Emily Smith',
    text: '"¡ Absolutamente delicioso! La mejor experiencia de comida a domicilio que he tenido. "',
    image: 'https://transformacionpersona.com/wp-content/uploads/2023/07/Testimonios-terapia-copia-oghl4hnys1k77op8f12rl1vef50ucedc7denp0rbqa.jpg',
  },
  {
    id: 2,
    name: 'Michael Brown',
    text: 'Excelente calidad y un servicio amable. ¡ Recomiendo Freshheat encarecidamente !',
    image: 'https://media.istockphoto.com/id/1265217247/es/foto/retrato-de-un-hombre-serio-en-el-estudio.jpg?s=612x612&w=0&k=20&c=1CPX6fmsJPgLn_6eY0Zw9HMMMXdS5cd2-SrAxN_Ir48=',
  },
  {
    id: 3,
    name: 'Sara Wilson',
    text: 'Fresco , caliente y siempre a tiempo. ¡Hago mi pedido todas las semanas !',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfedvj7xTMUJM3PzLz__3usxTNe8JXIkdzrNavNKf0gXhWfmDLCDDpMtQMID81GZUDEEE&usqp=CAU',
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2>Lo que dicen de nosotros</h2>
      <div className="testimonial-cards">
        {testimonials.map(({ id, name, text, image }) => (
          <div className="testimonial-card" key={id}>
            <img src={image} alt={name} />
            <p className="testimonial-text">"{text}"</p>
            <p className="testimonial-name">— {name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
