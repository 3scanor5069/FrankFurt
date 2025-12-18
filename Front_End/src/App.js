// src/App.js
import './index.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// ============================================
// IMPORTAR TOASTIFY PARA MI PERFIL
// ============================================
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import PaginaPrincipal from './pages/PaginaPrincipal';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutPage from './pages/AboutPage';
import MenuPage from './pages/MenuPage';
// import ResetPassword from './pages/ResetPassword'; // YA NO NECESARIO
import ForgotPassword from './pages/ForgotPassword';

import MenuDetail from './pages/MenuDetail';
import CartPage from './pages/CartPage'; 
import TeamPage from './pages/TeamPage';
import ServicesPage from './pages/ServicesPage';
import MiPerfil from './pages/MiPerfil';

// Components
import Ubications from './components/Ubications';
import DashboardBar from './components/DashboardBar';

// Admin
import FoodChainDashboard from './Administrador/dashboard';
import MenuCrud from './Administrador/MenuCrud';
import UsersCrud from './Administrador/UsersCrud';
import InventoryCrud from './Administrador/InventoryCrud';
import ManualSale from './Administrador/ManualSale';
import InventoryHistory from './Administrador/InventoryHistory';
import OrderManagementPage from './Administrador/OrderManagementPage';
import ReportsPage from './Administrador/ReportsPage';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Rutas del Dashboard Admin */}
            <Route path="/" element={<FoodChainDashboard />} />
            <Route path="/UsersCrud" element={<UsersCrud />} />
            <Route path="/MenuCrud" element={<MenuCrud />} />
            <Route path="/InventoryCrud" element={<InventoryCrud />} />
            <Route path="/ManualSale" element={<ManualSale />} />
            <Route path="/InventoryHistory" element={<InventoryHistory />} />
            <Route path="/DashboardBar" element={<DashboardBar />} />
            <Route path="/OrderManagementPage" element={<OrderManagementPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* Rutas Públicas */}
            <Route path="/p" element={<PaginaPrincipal />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            {/* <Route path="/ResetPassword" element={<ResetPassword />} /> YA NO NECESARIO */}
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/Ubications" element={<Ubications />} />
            <Route path="/equipo" element={<TeamPage />} />
            <Route path="/servicios" element={<ServicesPage />} />
            
            {/* Rutas de Menú y Carrito */}
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:id" element={<MenuDetail />} />
            <Route path="/cart" element={<CartPage />} />
            
            {/* Rutas de Usuario Autenticado */}
            <Route path="/MiPerfil" element={<MiPerfil />} />
            
            {/* Rutas de Mesas
                Se removieron las rutas de Selección de Mesas y Registro de Orden ya que
                dichos módulos no están implementados actualmente en el backend.
                Las órdenes se gestionan a través del carrito y las páginas de venta manual. */}
          </Routes>

          {/* ============================================
              TOAST CONTAINER - REQUERIDO PARA MI PERFIL
              ============================================ */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;