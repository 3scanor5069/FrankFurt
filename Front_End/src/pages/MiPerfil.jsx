import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import HeaderDashboard from '../components/HeaderDashboard';
import Footer from '../components/Footer'
import '../styles/MiPerfil.css';

// Construye la URL base para la API usando la variable de entorno REACT_APP_API_URL.
// Si no existe, se asume que el backend corre en localhost:3006.
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3006'}/api`;

const MiPerfil = () => {
  const navigate = useNavigate();

  // ============================================
  // ESTADOS - Información del Perfil
  // ============================================
  const [profileData, setProfileData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    rol: '',
    fecha_registro: ''
  });

  const [originalData, setOriginalData] = useState({
    correo: '',
    telefono: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // ============================================
  // ESTADOS - Cambiar Contraseña
  // ============================================
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [changingPassword, setChangingPassword] = useState(false);

  // ============================================
  // ESTADOS - Eliminar Cuenta
  // ============================================
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    step: 1, // 1: Confirmación inicial, 2: Ingresar contraseña
    password: '',
    showPassword: false
  });

  const [deletingAccount, setDeletingAccount] = useState(false);

  // ============================================
  // EFECTO - Cargar datos del perfil
  // ============================================
  useEffect(() => {
    fetchProfileData();
  }, []);

  // ============================================
  // FUNCIÓN - Obtener token JWT
  // ============================================
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ============================================
  // FUNCIÓN - Cargar datos del perfil (GET)
  // ============================================
  const fetchProfileData = async () => {
    try {
      setLoadingProfile(true);
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al cargar el perfil');
      }

      const data = await response.json();
      
      setProfileData({
        nombre: data.nombre || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        rol: data.rol || '',
        fecha_registro: data.fecha_registro || ''
      });

      setOriginalData({
        correo: data.correo || '',
        telefono: data.telefono || ''
      });

    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar los datos del perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  // ============================================
  // FUNCIÓN - Verificar si hay cambios en el perfil
  // ============================================
  const hasProfileChanges = () => {
    return (
      profileData.correo !== originalData.correo ||
      profileData.telefono !== originalData.telefono
    );
  };

  // ============================================
  // FUNCIÓN - Actualizar perfil (PUT)
  // ============================================
  const handleSaveProfile = async () => {
    if (!profileData.correo.trim()) {
      toast.error('El correo no puede estar vacío');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.correo)) {
      toast.error('El formato del correo no es válido');
      return;
    }

    try {
      setSavingProfile(true);

      const response = await fetch(`${API_BASE_URL}/users/profile/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          correo: profileData.correo,
          telefono: profileData.telefono
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el perfil');
      }

      const data = await response.json();
      
      // Actualizar el estado original con los nuevos datos
      setOriginalData({
        correo: profileData.correo,
        telefono: profileData.telefono
      });

      toast.success('Perfil actualizado correctamente');

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  // ============================================
  // FUNCIÓN - Cambiar contraseña (PUT)
  // ============================================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!passwordData.oldPassword) {
      toast.error('Ingresa tu contraseña actual');
      return;
    }

    if (!passwordData.newPassword) {
      toast.error('Ingresa una nueva contraseña');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar complejidad básica (al menos una letra y un número)
    const hasLetter = /[a-zA-Z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    
    if (!hasLetter || !hasNumber) {
      toast.error('La contraseña debe contener letras y números');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(`${API_BASE_URL}/users/profile/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar la contraseña');
      }

      // Limpiar el formulario
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setShowPasswords({
        old: false,
        new: false,
        confirm: false
      });

      toast.success('Contraseña cambiada correctamente');

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  // ============================================
  // FUNCIÓN - Abrir modal de eliminación
  // ============================================
  const openDeleteModal = () => {
    setDeleteModal({
      isOpen: true,
      step: 1,
      password: '',
      showPassword: false
    });
  };

  // ============================================
  // FUNCIÓN - Cerrar modal de eliminación
  // ============================================
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      step: 1,
      password: '',
      showPassword: false
    });
  };

  // ============================================
  // FUNCIÓN - Continuar a paso 2 del modal
  // ============================================
  const handleContinueDelete = () => {
    setDeleteModal(prev => ({ ...prev, step: 2 }));
  };

  // ============================================
  // FUNCIÓN - Eliminar cuenta (DELETE)
  // ============================================
  const handleDeleteAccount = async () => {
    if (!deleteModal.password) {
      toast.error('Ingresa tu contraseña para confirmar');
      return;
    }

    try {
      setDeletingAccount(true);

      const response = await fetch(`${API_BASE_URL}/users/profile/delete`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          password: deleteModal.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la cuenta');
      }

      toast.success('Cuenta eliminada correctamente');

      // Limpiar token y redirigir
      localStorage.removeItem('token');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      toast.error(error.message || 'Error al eliminar la cuenta');
    } finally {
      setDeletingAccount(false);
    }
  };

  // ============================================
  // FUNCIÓN - Formatear fecha
  // ============================================
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('es-ES', options);
  };

  // ============================================
  // RENDERIZADO DEL COMPONENTE
  // ============================================
  if (loadingProfile) {
    return (
      <div className="mp-container">
        <div className="mp-loading-state">
          <div className="mp-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mp-container">
        <HeaderDashboard/>
      <div className="mp-header">
        <h1>Mi Perfil</h1>
        <p>Administra tu información personal y configuración de seguridad</p>
      </div>

      {/* ============================================
          SECCIÓN 1: INFORMACIÓN DEL PERFIL
          ============================================ */}
      <div className="mp-profile-card">
        <div className="mp-card-header">
          <div className="mp-card-title">
            <User size={24} />
            <h2>Información del Perfil</h2>
          </div>
        </div>

        <div className="mp-card-body">
          {/* Campo: Nombre (Solo Lectura - No se puede modificar) */}
          <div className="mp-form-group">
            <label htmlFor="nombre" className="mp-form-label">
              <User size={18} />
              <span>Nombre Completo</span>
            </label>
            <input
              type="text"
              id="nombre"
              className="mp-form-input mp-readonly"
              value={profileData.nombre}
              disabled
              title="El nombre no se puede modificar"
            />
            <small className="mp-form-hint">
              El nombre no puede ser modificado
            </small>
          </div>

          {/* Campo: Correo (Editable) */}
          <div className="mp-form-group">
            <label htmlFor="correo" className="mp-form-label">
              <Mail size={18} />
              <span>Correo Electrónico</span>
            </label>
            <input
              type="email"
              id="correo"
              className="mp-form-input"
              value={profileData.correo}
              onChange={(e) => setProfileData({ ...profileData, correo: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Campo: Teléfono (Editable) */}
          <div className="mp-form-group">
            <label htmlFor="telefono" className="mp-form-label">
              <User size={18} />
              <span>Teléfono</span>
            </label>
            <input
              type="tel"
              id="telefono"
              className="mp-form-input"
              value={profileData.telefono}
              onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
              placeholder="Ej: 3001234567"
            />
          </div>

          {/* Campo: Rol (Solo Lectura) */}
          <div className="mp-form-group">
            <label htmlFor="rol" className="mp-form-label">
              <Shield size={18} />
              <span>Rol</span>
            </label>
            <input
              type="text"
              id="rol"
              className="mp-form-input mp-readonly"
              value={profileData.rol}
              disabled
            />
          </div>

          {/* Campo: Fecha de Registro (Solo Lectura) */}
          <div className="mp-form-group">
            <label htmlFor="fecha_registro" className="mp-form-label">
              <Calendar size={18} />
              <span>Fecha de Registro</span>
            </label>
            <input
              type="text"
              id="fecha_registro"
              className="mp-form-input mp-readonly"
              value={formatDate(profileData.fecha_registro)}
              disabled
            />
          </div>

          {/* Botón Guardar Cambios */}
          <div className="mp-card-actions">
            <button
              className="mp-btn-primary"
              onClick={handleSaveProfile}
              disabled={!hasProfileChanges() || savingProfile}
            >
              {savingProfile ? (
                <>
                  <div className="mp-btn-spinner"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================
          SECCIÓN 2: CAMBIAR CONTRASEÑA
          ============================================ */}
      <div className="mp-profile-card">
        <div className="mp-card-header">
          <div className="mp-card-title">
            <Lock size={24} />
            <h2>Cambiar Contraseña</h2>
          </div>
        </div>

        <div className="mp-card-body">
          <form onSubmit={handleChangePassword}>
            {/* Contraseña Actual */}
            <div className="mp-form-group">
              <label htmlFor="oldPassword" className="mp-form-label">
                <Lock size={18} />
                <span>Contraseña Actual</span>
              </label>
              <div className="mp-password-input-wrapper">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  id="oldPassword"
                  className="mp-form-input"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  className="mp-password-toggle-btn"
                  onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                  aria-label={showPasswords.old ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div className="mp-form-group">
              <label htmlFor="newPassword" className="mp-form-label">
                <Lock size={18} />
                <span>Nueva Contraseña</span>
              </label>
              <div className="mp-password-input-wrapper">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  className="mp-form-input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Mínimo 8 caracteres, con letras y números"
                />
                <button
                  type="button"
                  className="mp-password-toggle-btn"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  aria-label={showPasswords.new ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                <small className="mp-form-hint mp-error">
                  La contraseña debe tener al menos 8 caracteres
                </small>
              )}
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="mp-form-group">
              <label htmlFor="confirmPassword" className="mp-form-label">
                <Lock size={18} />
                <span>Confirmar Nueva Contraseña</span>
              </label>
              <div className="mp-password-input-wrapper">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  className="mp-form-input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Repite la nueva contraseña"
                />
                <button
                  type="button"
                  className="mp-password-toggle-btn"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  aria-label={showPasswords.confirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <small className="mp-form-hint mp-error">
                  Las contraseñas no coinciden
                </small>
              )}
            </div>

            {/* Botón Cambiar Contraseña */}
            <div className="mp-card-actions">
              <button
                type="submit"
                className="mp-btn-primary"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <div className="mp-btn-spinner"></div>
                    <span>Cambiando...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Cambiar Contraseña</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ============================================
          SECCIÓN 3: ELIMINAR CUENTA
          ============================================ */}
      <div className="mp-profile-card mp-danger-card">
        <div className="mp-card-header">
          <div className="mp-card-title">
            <AlertTriangle size={24} />
            <h2>Zona de Peligro</h2>
          </div>
        </div>

        <div className="mp-card-body">
          <p className="mp-danger-warning">
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.
          </p>

          <div className="mp-card-actions">
            <button
              className="mp-btn-danger"
              onClick={openDeleteModal}
            >
              <Trash2 size={18} />
              <span>Eliminar mi Cuenta</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================
          MODAL DE ELIMINACIÓN DE CUENTA
          ============================================ */}
      {deleteModal.isOpen && (
        <div className="mp-modal-overlay" onClick={closeDeleteModal}>
          <div className="mp-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="mp-modal-close"
              onClick={closeDeleteModal}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>

            {deleteModal.step === 1 ? (
              /* PASO 1: Confirmación Inicial */
              <>
                <div className="mp-modal-icon mp-danger">
                  <AlertTriangle size={48} />
                </div>

                <h2 className="mp-modal-title">¿Eliminar tu cuenta?</h2>
                
                <p className="mp-modal-description">
                  Esta acción es <strong>permanente e irreversible</strong>. 
                  Se eliminarán todos tus datos, pedidos y configuraciones.
                </p>

                <div className="mp-modal-actions">
                  <button
                    className="mp-btn-secondary"
                    onClick={closeDeleteModal}
                  >
                    Cancelar
                  </button>
                  <button
                    className="mp-btn-danger"
                    onClick={handleContinueDelete}
                  >
                    <AlertTriangle size={18} />
                    <span>Continuar</span>
                  </button>
                </div>
              </>
            ) : (
              /* PASO 2: Confirmar con Contraseña */
              <>
                <div className="mp-modal-icon mp-danger">
                  <Lock size={48} />
                </div>

                <h2 className="mp-modal-title">Confirma tu contraseña</h2>
                
                <p className="mp-modal-description">
                  Para eliminar tu cuenta, ingresa tu contraseña actual.
                </p>

                <div className="mp-modal-form">
                  <div className="mp-form-group">
                    <label htmlFor="deletePassword" className="mp-form-label">
                      <Lock size={18} />
                      <span>Contraseña</span>
                    </label>
                    <div className="mp-password-input-wrapper">
                      <input
                        type={deleteModal.showPassword ? 'text' : 'password'}
                        id="deletePassword"
                        className="mp-form-input"
                        value={deleteModal.password}
                        onChange={(e) => setDeleteModal(prev => ({ 
                          ...prev, 
                          password: e.target.value 
                        }))}
                        placeholder="Ingresa tu contraseña"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="mp-password-toggle-btn"
                        onClick={() => setDeleteModal(prev => ({ 
                          ...prev, 
                          showPassword: !prev.showPassword 
                        }))}
                        aria-label={deleteModal.showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {deleteModal.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mp-modal-actions">
                  <button
                    className="mp-btn-secondary"
                    onClick={closeDeleteModal}
                    disabled={deletingAccount}
                  >
                    Cancelar
                  </button>
                  <button
                    className="mp-btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || !deleteModal.password}
                  >
                    {deletingAccount ? (
                      <>
                        <div className="mp-btn-spinner"></div>
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        <span>Eliminar Definitivamente</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiPerfil;