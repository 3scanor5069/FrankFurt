// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram,
  FaBars, FaTimes, FaUser, FaShoppingCart, 
} from 'react-icons/fa';
import { Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuth();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLinkClick = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const getUserInitial = (nombre) => {
    if (!nombre) return 'U';
    const nameParts = nombre.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return nombre.charAt(0).toUpperCase();
  };

  const isActiveLink = (path) => location.pathname === path;

  const getMenuLink = (section) => {
    return location.pathname === '/menu' ? `#${section}` : `/menu#${section}`;
  };

  return (
    <header className="header">
      {/* Contact Bar - Minimalista */}
      <div className="contact-bar">
        <div className="container">
          
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation - Compacto */}
      <nav className="main-nav">
        <div className="container">
          {/* Logo */}
          <Link to="/p" className="logo" onClick={handleLinkClick}>
            <Crown className="crown-icon" />
            <div className="logo-text">
              <span className="brand-name">FRANK FURT</span>
              <span className="brand-tagline">Sabor Auténtico</span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <div className={`nav-wrapper ${mobileOpen ? 'nav-open' : ''}`}>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link 
                  to="/p" 
                  className={`nav-link ${isActiveLink('/p') ? 'active' : ''}`} 
                  onClick={handleLinkClick}
                >
                  Inicio
                </Link>
              </li>
              
              <li 
                className={`nav-item dropdown ${openDropdown === 'pages' ? 'active' : ''}`}
                onMouseEnter={() => setOpenDropdown('pages')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <span className="nav-link">Páginas</span>
                <ul className="dropdown-menu">
                  <li><Link to="/about" onClick={handleLinkClick}>Nosotros</Link></li>
                  <li><Link to="/equipo" onClick={handleLinkClick}>Equipo</Link></li>
                  <li><Link to="/servicios" onClick={handleLinkClick}>Servicios</Link></li>
                </ul>
              </li>

              <li 
                className={`nav-item dropdown ${openDropdown === 'menu' ? 'active' : ''}`}
                onMouseEnter={() => setOpenDropdown('menu')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link 
                  to="/menu" 
                  className={`nav-link ${isActiveLink('/menu') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  Menú
                </Link>
                <ul className="dropdown-menu">
                  <li><a href={getMenuLink('platos-principales')} onClick={handleLinkClick}>Platos Principales</a></li>
                  <li><a href={getMenuLink('bebidas')} onClick={handleLinkClick}>Bebidas</a></li>
                  <li><a href={getMenuLink('postres')} onClick={handleLinkClick}>Postres</a></li>
                </ul>
              </li>

              <li className="nav-item">
                <Link 
                  to="/ubications" 
                  className={`nav-link ${isActiveLink('/ubications') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  Ubicaciones
                </Link>
              </li>

              <li className="nav-item">
                <Link 
                  to="/cart" 
                  className={`nav-link cart-link ${isActiveLink('/cart') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <FaShoppingCart /> <span>Carrito</span>
                </Link>
              </li>
            </ul>

            {/* Mobile User Section */}
            {mobileOpen && (
              <div className="mobile-actions">
                {isAuthenticated && user ? (
                  <>
                    <div className="mobile-user-info">
                      <div className="mobile-avatar">
                        {getUserInitial(user.nombre)}
                      </div>
                      <div className="mobile-user-details">
                        <span className="mobile-user-name">{user.nombre}</span>
                        <span className="mobile-user-rol">{user.rol}</span>
                      </div>
                    </div>
                    <Link to="/MiPerfil" className="mobile-btn" onClick={handleLinkClick}>
                      <FaUser /> Mi Perfil
                    </Link>
                    <button className="mobile-btn logout-btn" onClick={handleLogout}>
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="mobile-btn primary" onClick={handleLinkClick}>
                      Iniciar Sesión
                    </Link>
                    <Link to="/register" className="mobile-btn secondary" onClick={handleLinkClick}>
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Header Actions - Desktop */}
          <div className="header-actions">
            {isAuthenticated && user ? (
              <div 
                className="user-menu-container" 
                ref={userMenuRef}
              >
                <button 
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <div className="user-avatar">
                    {getUserInitial(user.nombre)}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.nombre}</span>
                    <span className="user-rol">{user.rol}</span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div className="dropdown-avatar">
                        {getUserInitial(user.nombre)}
                      </div>
                      <div className="dropdown-user-info">
                        <span className="dropdown-name">{user.nombre}</span>
                        <span className="dropdown-rol">{user.rol}</span>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link 
                      to="/MiPerfil" 
                      className="dropdown-item" 
                      onClick={handleLinkClick}
                    >
                      <FaUser /> <span>Mi Perfil</span>
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item logout-item" 
                      onClick={handleLogout}
                    >
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login" onClick={handleLinkClick}>
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn-register" onClick={handleLinkClick}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;