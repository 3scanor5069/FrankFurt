import React, {useState, useEffect} from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingCart, DollarSign, TrendingUp, Menu, X, Home, Package, FileText, Settings, LogOut, Bell, UtensilsCrossed, History } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import Dashboard from '../Administrador/dashboard';

const DashboardBar = () => {
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const navigate = useNavigate();
      
    


      
const menuItems = [
          { icon: Home, label: 'Dashboard', active: true, path: '/dashboard' },
          { icon: Users, label: 'Usuarios', path: '/UsersCrud' },
          { icon: ShoppingCart, label: 'Pedidos', path: '/restaurantOrders' },
          { icon: UtensilsCrossed, label: 'Menú', path: '/MenuCrud' },
          { icon: Package, label: 'Inventario', path: '/InventoryCrud' },
          { icon: History, label: 'Historial de inventario', path: '/History' },
          { icon: FileText, label: 'Reportes', path: '/reports' },
          { icon: Settings, label: 'Configuración', path: '/settings' }
        ];  

const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path); 
  };

return(
<div className="dashboard-container">
 <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <h2 className="logo-text">🍔 Frank Furt</h2>
          <p className="logo-subtext">Panel Administrativo</p>
        </div>
        
        <nav className="nav">
          {menuItems.map((item, index) => (
            <a 
              key={index} 
              href="#" 
              className={`nav-item ${item.active ? 'nav-item-active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.path);
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer-dash">
          <a href="#" className="nav-item" onClick={(e) => {
            e.preventDefault();
            // Implementa logout aquí
            console.log('Logout');
          }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      </div>
 );
}

 export default DashboardBar;