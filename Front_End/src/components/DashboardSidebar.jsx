import React from 'react';
import './DashboardSidebar.css';

/**
 * DashboardSidebar
 *
 * Este componente encapsula la barra lateral del dashboard administrativo.
 * Recibe un arreglo de items de menú y una función de navegación para
 * permitir que otras páginas del dashboard reutilicen la misma barra.
 * También soporta un flag `open` para mostrar u ocultar la barra en
 * dispositivos pequeños y un callback `onToggle` para cerrar el menú.
 */
const DashboardSidebar = ({ items, onNavigate, open = false, onToggle }) => {
  return (
    <>
      <div className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <h2 className="logo-text">🍔 Frank Furt</h2>
          <p className="logo-subtext">Panel Administrativo</p>
        </div>
        <nav className="nav">
          {items.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`nav-item ${item.active ? 'nav-item-active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.path);
                if (open && onToggle) {
                  // Cerrar la barra en móvil al navegar
                  onToggle();
                }
              }}
            >
              {/* Renderizar el icono correspondiente */}
              {item.icon && <item.icon size={20} />}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
      {/* Overlay para móvil */}
      {open && <div className="sidebar-overlay" onClick={onToggle}></div>}
    </>
  );
};

export default DashboardSidebar;