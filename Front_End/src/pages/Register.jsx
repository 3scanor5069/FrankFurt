import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, Loader2 } from 'lucide-react';
import { Link} from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    correo: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  // URL base para el registro de usuarios. Configurable mediante REACT_APP_API_URL.
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    // Validar apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    // Validar correo
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido';
    } else if (!correoRegex.test(formData.correo)) {
      newErrors.correo = 'El formato del correo no es válido';
    }

    // Validar teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
 e.preventDefault();
 
 const newErrors = validateForm();
 if (Object.keys(newErrors).length > 0) {
  setErrors(newErrors);
  return;
 }

 setIsLoading(true);
 setErrors({});

 try {
  const nombreCompleto = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
  
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
   },
   body: JSON.stringify({
    nombre: nombreCompleto,
    correo: formData.correo.trim().toLowerCase(), // ¡Cambiado a 'correo'!
    password: formData.password
   })
  });

 const data = await response.json();

    if (response.ok) { // Confiar en el código de estado HTTP
        alert('¡Registro exitoso! Bienvenido a Frank Furt');
        window.location.href = '/login'; // Redirigir al login
    } else {
        // Manejo de errores específicos del backend
        if (response.status === 409) {
            setErrors({ correo: 'El correo ya está registrado.' });
        } else {
            setErrors({ api: data.message || 'Error en el registro.' });
        }
    }
 } catch (error) {
  console.error('Error en el registro:', error);
  setErrors({ api: 'Error de conexión. Por favor, intenta nuevamente.' });
 } finally {
  setIsLoading(false);
 }
};

  const handleSwitchToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        
        <div className="register-header">
          <div className="register-icon">
            <User className="icon" />
          </div>
          <h1 className="register-title">FRANK FURT</h1>
          <p className="register-subtitle">Crear nueva cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="name-row">
            <div className="input-group-register">
              <input
                type="text"
                name="firstName"
                placeholder="Nombre*"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`register-input ${errors.firstName ? 'error' : ''}`}
                disabled={isLoading}
                required
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="input-group-register">
              <input
                type="text"
                name="lastName"
                placeholder="Apellido*"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`register-input ${errors.lastName ? 'error' : ''}`}
                disabled={isLoading}
                required
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="input-group-register">
            <div className="input-icon">
              <Mail className="icon-small" />
            </div>
            <input
              type="correo"
              name="correo"
              placeholder="Correo electrónico*"
              value={formData.correo}
              onChange={handleInputChange}
              className={`register-input ${errors.correo ? 'error' : ''}`}
              disabled={isLoading}
              required
            />
            {errors.correo && <span className="error-message">{errors.correo}</span>}
          </div>

          <div className="input-group-register">
            <div className="input-icon">
              <Phone className="icon-small" />
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono*"
              value={formData.phone}
              onChange={handleInputChange}
              className={`register-input ${errors.phone ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="input-group-register">
            <div className="input-icon">
              <MapPin className="icon-small" />
            </div>
            <input
              type="text"
              name="address"
              placeholder="Dirección*"
              value={formData.address}
              onChange={handleInputChange}
              className="register-input"
              disabled={isLoading}
            />
          </div>

          <div className="input-group-register">
            <div className="input-icon">
              <Lock className="icon-small" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña*"
              value={formData.password}
              onChange={handleInputChange}
              className={`register-input password-input ${errors.password ? 'error' : ''}`}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="icon-small" /> : <Eye className="icon-small" />}
            </button>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="input-group-register">
            <div className="input-icon-register">
              <Lock className="icon-small" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmar contraseña*"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`register-input password-input ${errors.confirmPassword ? 'error' : ''}`}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="icon-small" /> : <Eye className="icon-small" />}
            </button>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="terms-checkbox">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                className="custom-checkbox" 
                disabled={isLoading}
                required 
              />
              <span className="checkbox-text">
                Acepto los{' '}
                <a href="#" className="terms-link">
                  términos y condiciones
                </a>
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="icon-small animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="register-divider">
          <div className="divider-line"></div>
          <span className="divider-text">o</span>
          <div className="divider-line"></div>
        </div>

        <div className="register-switch">
          <p className="switch-text">
            ¿Ya tienes cuenta?{' '}
          <li><Link to="/Login" onClick={handleSwitchToLogin}>Login</Link></li>

          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 