// src/components/HeaderDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, RefreshCw, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/HeaderDashboard.css';

const HeaderDashboard = ({ 
  sidebarOpen, 
  toggleSidebar, 
  onRefresh, 
  title = "Dashboard" 
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();

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

  // Función para obtener iniciales del nombre
  const getUserInitial = (nombre) => {
    if (!nombre) return 'A';
    const nameParts = nombre.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return nombre.charAt(0).toUpperCase();
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  // Función para ir a Mi Perfil
  const handleProfile = () => {
    setUserMenuOpen(false);
    navigate('/MiPerfil');
  };

  return (
    <header className="header-dashboard">
      <div className="header-dashboard-left">
        <button 
          className="menu-button-dashboard"
          onClick={toggleSidebar}
          title="Toggle menu"
          aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="title-dashboard">{title}</h1>
      </div>
      
      <div className="header-dashboard-right">
        <button 
          className="refresh-button-dashboard" 
          onClick={onRefresh} 
          title="Actualizar datos"
          aria-label="Actualizar datos"
        >
          <RefreshCw size={20} />
          <span className="refresh-text">Actualizar</span>
        </button>

        <button 
          className="notification-button-dashboard" 
          title="Notificaciones"
          aria-label="Notificaciones"
        >
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        {/* User Menu con Dropdown */}
        <div 
          className="user-menu-dashboard-container" 
          ref={userMenuRef}
        >
          <button 
            className="user-menu-dashboard-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
            title={user?.nombre || 'Usuario'}
          >
            <div className="user-avatar-dashboard">
              {getUserInitial(user?.nombre || 'Admin')}
            </div>
            <div className="user-info-dashboard">
              <span className="user-name-dashboard">
                {user?.nombre || 'Administrador'}
              </span>
              <span className="user-rol-dashboard">
                {user?.rol || 'admin'}
              </span>
            </div>
            <ChevronDown 
              size={18} 
              className={`chevron-icon ${userMenuOpen ? 'chevron-open' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className="user-dropdown-dashboard">
              {/* Header del dropdown con info del usuario */}
              <div className="user-dropdown-header-dashboard">
                <div className="dropdown-avatar-dashboard">
                  {getUserInitial(user?.nombre || 'Admin')}
                </div>
                <div className="dropdown-user-info-dashboard">
                  <span className="dropdown-name-dashboard">
                    {user?.nombre || 'Administrador'}
                  </span>
                  <span className="dropdown-email-dashboard">
                    {user?.correo || 'admin@frankfurt.com'}
                  </span>
                  <span className="dropdown-rol-badge-dashboard">
                    {user?.rol || 'admin'}
                  </span>
                </div>
              </div>
              
              <div className="dropdown-divider-dashboard"></div>
              
              {/* Opción: Mi Perfil */}
              <button 
                className="dropdown-item-dashboard" 
                onClick={handleProfile}
              >
                <User size={18} />
                <span>Mi Perfil</span>
              </button>
              
              <div className="dropdown-divider-dashboard"></div>
              
              {/* Opción: Cerrar Sesión */}
              <button 
                className="dropdown-item-dashboard logout-item-dashboard" 
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderDashboard;