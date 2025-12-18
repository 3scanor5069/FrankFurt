// src/pages/Login.jsx - CON REDIRECCIÓN POR ROL
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Crown, Mail, Lock, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // URL base para los endpoints de autenticación. Configurable mediante REACT_APP_API_URL.
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';
  
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/p');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.correo.trim()) {
      setError('El correo es requerido');
      return false;
    }
    if (!formData.password.trim()) {
      setError('La contraseña es requerida');
      return false;
    }

    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(formData.correo)) {
      setError('Correo inválido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: formData.correo.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();
      console.log(data.token);
      if (response.ok && data.token && data.user) {
        setSuccess('¡Login exitoso! Redirigiendo...');
        
        // Guardar en AuthContext
        const loginSuccess = login(data.token, data.user);
        
        if (loginSuccess) {
          console.log('✅ Usuario logueado:', data.user);
          
          // ✅ REDIRECCIÓN SEGÚN ROL
          setTimeout(() => {
            if (data.user.rol === 'administrador' ) {
              // Admin → Dashboard administrativo
              navigate('/');
              console.log('🔐 Redirigiendo a Dashboard Admin');
            } else {
              // Cliente → Página principal
              navigate('/p');
              console.log('👤 Redirigiendo a Página Principal');
            }
          }, 1500);
        } else {
          setError('Error al procesar los datos de autenticación');
        }
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        
        <div className="login-header">
          <div className="login-icon">
            <Crown className="icon" />
          </div>
          <h1 className="login-title">FRANK FURT</h1>
          <p className="login-subtitle">Bienvenido de vuelta</p>
        </div>

        {error && (
          <div className="message-container error-message">
            <AlertCircle className="message-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message-container success-message">
            <div className="success-icon">✓</div>
            <span>{success}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group-login">
             <div className="input-icon-login">
                <Mail className="icon-small" />
              </div>
            <input
              type="email"
              id="correo"
              name="correo"
              className="form-input"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="input-group-login">
            <div className="input-icon-login">
              <Lock className="icon-small" />
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <Link to="/ForgotPassword" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="login-divider">
          <div className="divider-line"></div>
          <span className="divider-text">o</span>
          <div className="divider-line"></div>
        </div>

        <div className="login-switch">
          <p className="switch-text">
            ¿No tienes cuenta?{' '}
            <Link to="/Register" className="switch-link">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;