import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/CartPage.css';

// Construye la URL base para la API usando la variable de entorno REACT_APP_API_URL.
// Si no existe, se asume que el backend corre en localhost:3006.
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3006'}/api`;

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getTotalPrice,
    getTotalItems 
  } = useCart();

  const [customizations, setCustomizations] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState('');
  const [loadingMesas, setLoadingMesas] = useState(false);

  // ========================================
  // CARGAR MESAS DISPONIBLES
  // ========================================
  useEffect(() => {
    if (user) {
      fetchMesasDisponibles();
    }
  }, [user]);

  const fetchMesasDisponibles = async () => {
    try {
      setLoadingMesas(true);
      // Incluir el token JWT en la cabecera para superar el middleware de autenticación
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/mesas/available`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las mesas');
      }

      const data = await response.json();
      // El backend retorna un arreglo de mesas bajo la propiedad "mesas"
      setMesas(data.mesas || []);
    } catch (error) {
      console.error('Error cargando mesas:', error);
      toast.error('No se pudieron cargar las mesas disponibles');
    } finally {
      setLoadingMesas(false);
    }
  };

  // ========================================
  // MANEJO DE PERSONALIZACIONES
  // ========================================
  const handleCustomizationChange = (id, value) => {
    setCustomizations((prev) => ({ ...prev, [id]: value }));
  };

  // ========================================
  // CONFIRMAR PEDIDO
  // ========================================
  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!user) {
      toast.error('Debes iniciar sesión para hacer un pedido');
      navigate('/login');
      return;
    }

    if (!selectedMesa) {
      toast.error('Por favor, selecciona una mesa para tu pedido');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');

      // Preparar productos con personalizaciones
      const productos = cartItems.map(item => ({
        idProducto: item.id,
        cantidad: item.quantity,
        precio: item.price,
        subtotal: item.price * item.quantity,
        notas: customizations[item.id] || null
      }));

      // Construir observaciones generales del pedido
      const observacionesGenerales = Object.entries(customizations)
        .filter(([_, value]) => value && value.trim())
        .map(([id, value]) => {
          const item = cartItems.find(i => i.id === parseInt(id));
          return `${item?.name}: ${value}`;
        })
        .join(' | ');

      // Crear pedido en el backend
      const response = await fetch(`${API_BASE_URL}/pedidos/manual-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // Utilizar el identificador de usuario proporcionado por AuthContext
          idUsuario: user?.id || user?.idUsuario,
          idMesa: parseInt(selectedMesa),
          productos: productos,
          observaciones: observacionesGenerales || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const data = await response.json();

      // Éxito
      setOrderId(data.idPedido);
      setOrderPlaced(true);
      clearCart();
      setCustomizations({});
      setSelectedMesa('');
      
      toast.success('¡Pedido realizado correctamente!', {
        position: 'top-right',
        autoClose: 3000
      });

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/menu');
      }, 3000);

    } catch (error) {
      console.error('Error al confirmar pedido:', error);
      toast.error(error.message || 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // RENDERIZAR CONFIRMACIÓN DE PEDIDO
  // ========================================
  if (orderPlaced) {
    return (
      <div className="cart-page-wrapper">
        <Header />
        <main className="cart-page">
          <div className="order-success">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h1>¡Pedido Realizado!</h1>
            <p>Tu pedido #{orderId} ha sido creado exitosamente</p>
            <p className="success-message">
              Tu pedido está en estado <strong>pendiente</strong> y será procesado pronto.
              Recibirás notificaciones sobre el estado de tu pedido.
            </p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/menu')}
            >
              Volver al Menú
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ========================================
  // RENDERIZAR CARRITO
  // ========================================
  return (
    <div className="cart-page-wrapper">
      <Header />
      <main className="cart-page">
        <div className="cart-header">
          <div className="cart-title-section">
            <ShoppingCart size={32} />
            <h1>Tu Carrito</h1>
          </div>
          {cartItems.length > 0 && (
            <div className="cart-count">
              {getTotalItems()} producto{getTotalItems() > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={64} />
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos desde nuestro menú para empezar tu pedido</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/menu')}
            >
              Ver Menú
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {item.image && (
                      <img src={item.image} alt={item.name} />
                    )}
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <div className="item-price">
                      ${Number(item.price).toLocaleString('es-CO')} c/u
                    </div>
                    
                    <div className="item-quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="item-customization">
                      <label>Personalización:</label>
                      <textarea
                        className="customization-input"
                        placeholder="Ej: Sin cebolla, extra queso..."
                        value={customizations[item.id] || ''}
                        onChange={(e) => handleCustomizationChange(item.id, e.target.value)}
                        rows="2"
                      />
                    </div>
                  </div>

                  <div className="item-actions">
                    <div className="item-subtotal">
                      ${Number(item.price * item.quantity).toLocaleString('es-CO')}
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => removeFromCart(item.id)}
                      title="Eliminar del carrito"
                    >
                      <Trash2 size={18} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              {/* SELECTOR DE MESA */}
              <div className="mesa-selection">
                <label htmlFor="mesa-select" className="mesa-label">
                  <strong>Selecciona tu mesa:</strong>
                </label>
                {loadingMesas ? (
                  <p className="loading-mesas">Cargando mesas...</p>
                ) : (
                  <select
                    id="mesa-select"
                    className="mesa-select"
                    value={selectedMesa}
                    onChange={(e) => setSelectedMesa(e.target.value)}
                    required
                  >
                    <option value="">-- Selecciona una mesa --</option>
                    {mesas.map((mesa) => (
                      <option key={mesa.idMesa} value={mesa.idMesa}>
                        Mesa {mesa.numero}
                      </option>
                    ))}
                  </select>
                )}
                {!selectedMesa && cartItems.length > 0 && (
                  <p className="mesa-warning">
                    <AlertCircle size={16} />
                    <span>Debes seleccionar una mesa para continuar</span>
                  </p>
                )}
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${getTotalPrice().toLocaleString('es-CO')}</span>
                </div>
                <div className="summary-row total">
                  <span><strong>Total:</strong></span>
                  <span className="total-price">
                    <strong>${getTotalPrice().toLocaleString('es-CO')}</strong>
                  </span>
                </div>
              </div>

              <div className="summary-info">
                <AlertCircle size={18} />
                <p>
                  Tu pedido quedará en estado <strong>pendiente</strong> hasta que el 
                  restaurante lo procese. No se requiere pago por adelantado.
                </p>
              </div>

              <div className="summary-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/menu')}
                >
                  Seguir Comprando
                </button>
                <button
                  className="btn-primary btn-confirm"
                  onClick={handleConfirmOrder}
                  disabled={submitting || !selectedMesa}
                >
                  {submitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;