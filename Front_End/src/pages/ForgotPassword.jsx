// ForgotPassword.jsx - CON VALIDACIÓN DE CÓDIGO
import React, { useState } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: código, 3: nueva contraseña
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // URL base para los endpoints de recuperación de contraseña. Puede configurarse mediante
  // la variable de entorno REACT_APP_API_URL. Si no existe, se usa localhost por defecto.
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // PASO 1: Enviar código al correo
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!validateEmail(correo)) {
      setError('Por favor ingresa un correo válido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Código enviado a tu correo');
        setStep(2); // Pasar a paso 2
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al enviar el código');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Verificar código
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!codigo.trim() || codigo.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo: codigo.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Código verificado correctamente');
        setStep(3); // Pasar a paso 3
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Código incorrecto');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  // PASO 3: Restablecer contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!nuevaPassword || nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo, nuevaPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('¡Contraseña restablecida exitosamente!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Error al restablecer contraseña');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>

        <Link to="/Login" className="back-button">
          <ArrowLeft size={20} />
          <span>Volver al login</span>
        </Link>

        <div className="forgot-password-header">
          <div className="forgot-icon">
            {step === 1 && <Mail className="icon" />}
            {step === 2 && <Key className="icon" />}
            {step === 3 && <CheckCircle className="icon" />}
          </div>
          <h1 className="forgot-title">
            {step === 1 && '¿Olvidaste tu contraseña?'}
            {step === 2 && 'Verifica tu código'}
            {step === 3 && 'Nueva contraseña'}
          </h1>
          <p className="forgot-subtitle">
            {step === 1 && 'Te enviaremos un código de verificación'}
            {step === 2 && 'Revisa tu correo e ingresa el código de 6 dígitos'}
            {step === 3 && 'Ingresa tu nueva contraseña'}
          </p>
        </div>

        {error && (
          <div className="message-container error-message">
            <AlertCircle className="message-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message-container success-message">
            <CheckCircle className="message-icon" />
            <span>{success}</span>
          </div>
        )}

        {/* PASO 1: Ingresar correo */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="forgot-form">
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <div className="input-group">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="tucorreo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {/* PASO 2: Ingresar código */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="forgot-form">
            <div className="form-group">
              <label className="form-label">Código de verificación</label>
              <input
                type="text"
                className="form-input code-input"
                placeholder="000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                maxLength={6}
                autoFocus
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
              />
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
                Código enviado a: <strong>{correo}</strong>
              </p>
            </div>

            <button type="submit" className="submit-button" disabled={loading || codigo.length !== 6}>
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>

            <button 
              type="button" 
              className="link-button"
              onClick={() => {
                setStep(1);
                setCodigo('');
                setError('');
              }}
            >
              Cambiar correo
            </button>
          </form>
        )}

        {/* PASO 3: Nueva contraseña */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
