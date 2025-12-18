import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Crown, Mail, Lock, AlertCircle } from 'lucide-react';
import {
  FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, 
  FaUtensils, FaHeart, FaArrowUp, FaWhatsapp
} from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="brand-logo">
                <div className="login-icon">
                   <Crown className="icon" />
                </div>
                <div className="brand-text">
                  <h2 className="brand-name">FRANK FURT</h2>
                  <span className="brand-tagline">Comidas Rápidas Premium</span>
                </div>
              </div>
              <p className="brand-description">
                Desde 2020, llevamos la mejor experiencia gastronómica a tu mesa. 
                Sabores únicos, ingredientes frescos y la tradición que nos caracteriza.
              </p>
              <div className="social-links">
                <a href="#" className="social-link facebook" aria-label="Facebook">
                  <FaFacebookF />
                </a>
                <a href="#" className="social-link twitter" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="social-link linkedin" aria-label="LinkedIn">
                  <FaLinkedinIn />
                </a>
                <a href="#" className="social-link instagram" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="social-link whatsapp" aria-label="WhatsApp">
                  <FaWhatsapp />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="section-title">
                <FaUtensils className="section-icon" />
                Enlaces Rápidos
              </h4>
              <ul className="footer-links">
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/about">Acerca de Nosotros</Link></li>
                <li><Link to="/menu">Nuestro Menú</Link></li>
                <li><Link to="/servicios">Servicios</Link></li>
                <li><Link to="/equipo">Nuestro Equipo</Link></li>
                <li><Link to="/ubicaciones">Ubicaciones</Link></li>
              </ul>
            </div>

            {/* Menu Categories */}
            <div className="footer-section">
              <h4 className="section-title">
                <FaUtensils className="section-icon" />
                Categorías
              </h4>
              <ul className="footer-links">
                <li><Link to="/menu#entradas">Entradas</Link></li>
                <li><Link to="/menu#platosprincipales">Platos Principales</Link></li>
                <li><Link to="/menu#postres">Postres</Link></li>
                <li><Link to="/menu#bebidas">Bebidas</Link></li>
                <li><Link to="/menu#combos">Combos Especiales</Link></li>
                <li><Link to="/menu#promociones">Promociones</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4 className="section-title">
                <FaMapMarkerAlt className="section-icon" />
                Contacto
              </h4>
              <div className="contact-info">
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div className="contact-details">
                    <strong>Dirección</strong>
                    <span>Bogotá, Colombia</span>
                    <span>Calle 123 #45-67</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <div className="contact-details">
                    <strong>Teléfono</strong>
                    <a href="tel:+573102862229">+57 310 286 2229</a>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div className="contact-details">
                    <strong>Email</strong>
                    <a href="mailto:frankfurt28@gmail.com">frankfurt28@gmail.com</a>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FaClock className="contact-icon" />
                  <div className="contact-details">
                    <strong>Horarios</strong>
                    <span>Lun-Vie: 8:00AM - 5:30PM</span>
                    <span>Sáb-Dom: 7:00AM - 5:30PM</span>
                    <span>Festivos: 9:30AM - 3:30PM</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            <div className="copyright">
              <p>
                &copy; 2025 <strong>Frank Furt</strong>. Todos los derechos reservados.
              </p>
              <p className="made-with">
                Hecho con <FaHeart className="heart-icon" /> en Bogotá, Colombia
              </p>
            </div>
            
            <div className="footer-links-bottom">
              <Link to="/privacy">Política de Privacidad</Link>
              <Link to="/terms">Términos y Condiciones</Link>
              <Link to="/cookies">Política de Cookies</Link>
            </div>
            
            <button className="scroll-top" onClick={scrollToTop} aria-label="Volver arriba">
              <FaArrowUp />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="floating-actions">
        <a 
          href="https://wa.me/573102862229" 
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp />
        </a>
      </div>
    </footer>
  );
};


export default Footer;