import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, ShoppingCart, DollarSign, TrendingUp, Menu, X, Home, Package, FileText, Settings, Bell, UtensilsCrossed, History, RefreshCw, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import HeaderDashboard from '../components/HeaderDashboard';
import DashboardSidebar from '../components/DashboardSidebar';
import 'react-toastify/dist/ReactToastify.css';
import './dashboard.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState({ name: 'Admin', avatar: 'A' });
  const [selectedFilter, setSelectedFilter] = useState('mensual');
  const navigate = useNavigate();

  // Estados para los datos del dashboard
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0,
    activeOrders: 0
  });
  
  const [salesData, setSalesData] = useState([]);
  const [newUsersData, setNewUsersData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [usersWithoutOrders, setUsersWithoutOrders] = useState([]);

  // Construye la URL base para la API usando la variable de entorno REACT_APP_API_URL.
  // Si no existe, se asume que el backend corre en localhost:3006.
  const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3006'}/api`;

  // Formato de moneda colombiana
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Tooltip personalizado para gráficas de dinero
  const CustomTooltipCurrency = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.label}</p>
          <p style={{ margin: 0, color: '#FF6B6B' }}>
            Ventas: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para usuarios
  const CustomTooltipUsers = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.label}</p>
          <p style={{ margin: 0, color: '#4ECDC4' }}>
            Usuarios: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Función para obtener usuario actual
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No token found');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/users/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to verify token');
      }

      const data = await res.json();
      const userName = data.user?.nombre || data.nombre || 'Admin';
      const userRole = data.user?.rol || data.rol || 'administrador';
      
      setCurrentUser({
        name: userName.split(' ')[0],
        fullName: userName,
        role: userRole,
        avatar: userName.charAt(0).toUpperCase()
      });

    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUser({ name: 'Admin', avatar: 'A' });
    }
  }, [API_BASE_URL]);

  // Función reutilizable para fetch
  const fetchData = useCallback(async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }, [API_BASE_URL]);

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async (showToast = false) => {
    setLoading(true);
    setError(null);

    try {
      const [
        metricsData,
        salesDataRes,
        usersDataRes,
        productsData,
        usersWithoutOrdersData
      ] = await Promise.all([
        fetchData(`/dashboard/metrics?filter=${selectedFilter}`),
        fetchData(`/dashboard/sales?filter=${selectedFilter}`),
        fetchData(`/dashboard/new-users?filter=${selectedFilter}`),
        fetchData(`/dashboard/top-products?filter=${selectedFilter}`),
        fetchData(`/dashboard/users-without-orders`)
      ]);

      setMetrics(metricsData);
      setSalesData(salesDataRes);
      setNewUsersData(usersDataRes);
      setTopProducts(productsData);
      setUsersWithoutOrders(usersWithoutOrdersData);

      if (showToast) {
        toast.success('Dashboard actualizado', {
          position: 'top-right',
          autoClose: 2000
        });
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Error al cargar los datos del dashboard');
      toast.error('Error al cargar datos', {
        position: 'top-right',
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  }, [fetchData, selectedFilter]);

  // Carga inicial
  useEffect(() => {
    const initDashboard = async () => {
      await fetchCurrentUser();
      await loadDashboardData(false);
    };
    initDashboard();
  }, [fetchCurrentUser, loadDashboardData]);

  // Actualizar cuando cambia el filtro
  useEffect(() => {
    if (!loading) {
      loadDashboardData(false);
    }
  }, [selectedFilter]);

  // Refresh manual
  const handleRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Navegación
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Items del menú
  const menuItems = useMemo(() => [
    { icon: Home, label: 'Dashboard', active: true, path: '/dashboard' },
    { icon: Users, label: 'Usuarios', path: '/UsersCrud' },
    { icon: ShoppingCart, label: 'Pedidos', path: '/OrderManagementPage' },
    { icon: UtensilsCrossed, label: 'Menú', path: '/MenuCrud' },
    { icon: Package, label: 'Inventario', path: '/InventoryCrud' },
    { icon: FileText, label: 'Reportes', path: '/reports' },
  ], []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Opciones de filtro
  const filterOptions = [
    { value: 'diario', label: 'Diario' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'anual', label: 'Anual' }
  ];

  // Loading state
  if (loading && !metrics.totalUsers) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ToastContainer limit={3} />

      <DashboardSidebar
        items={menuItems}
        onNavigate={handleNavigation}
        open={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <div className="main-content-dash">
        <HeaderDashboard
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onRefresh={handleRefresh}
          title="Dashboard"
        />

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* Selector de Filtros */}
        <div className="filter-section">
          <div className="filter-container">
            <Filter size={20} />
            <label htmlFor="dashboard-filter">Período:</label>
            <select
              id="dashboard-filter"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="filter-select"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon users-icon">
              <Users size={24} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.totalUsers.toLocaleString()}</h3>
              <p className="metric-label">Usuarios Registrados</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon orders-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.totalOrders.toLocaleString()}</h3>
              <p className="metric-label">Pedidos ({selectedFilter})</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon revenue-icon">
              <DollarSign size={24} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{formatCurrency(metrics.revenue)}</h3>
              <p className="metric-label">Ingresos ({selectedFilter})</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon trending-icon">
              <TrendingUp size={24} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.activeOrders.toLocaleString()}</h3>
              <p className="metric-label">Pedidos Activos</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Ventas */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Ventas - {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  label={{ value: 'COP $', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltipCurrency />} />
                <Bar dataKey="valor" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Nuevos Usuarios */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Nuevos Usuarios - {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={newUsersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Usuarios', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltipUsers />} />
                <Line 
                  type="monotone" 
                  dataKey="usuarios" 
                  stroke="#4ECDC4" 
                  strokeWidth={2}
                  dot={{ fill: '#4ECDC4', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Productos */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Productos Más Vendidos - {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}</h3>
            </div>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>No hay datos disponibles para el período seleccionado</p>
              </div>
            )}
          </div>

          {/* Usuarios Sin Pedidos */}
          <div className="chart-card table-card">
            <div className="chart-header">
              <h3>Últimos 10 Usuarios Sin Pedidos</h3>
            </div>
            <div className="table-container">
              {usersWithoutOrders.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Fecha Registro</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersWithoutOrders.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.date).toLocaleDateString('es-CO')}</td>
                        <td>
                          <span className={`status-badge ${user.status === 'Activo' ? 'status-active' : 'status-inactive'}`}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p>¡Excelente! Todos los usuarios han realizado al menos un pedido</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
