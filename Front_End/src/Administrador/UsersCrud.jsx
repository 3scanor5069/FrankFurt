// UsersCrud.jsx - CORREGIDO con Portal para modales
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, Plus, Edit, Trash2, Filter, Download, Eye, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UsersCrud.css';

// Construye la URL base para la API usando la variable de entorno REACT_APP_API_URL.
// Si no existe, se asume que el backend corre en localhost:3006.
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3006'}/api/users`;

// Componente Modal usando Portal
const Modal = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};

const UsersCrud = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    hobby: '',
    status: 'active'
  });

  // Configurar la cabecera Authorization con el token JWT, si existe.
  // Esto asegura que todas las peticiones realizadas mediante axios en este
  // componente incluyan el token y pasen la verificación del middleware
  // `protect` en el backend.  Al utilizar axios.defaults.headers.common,
  // evitamos repetir la configuración en cada solicitud.
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const statusOptions = ['Todos', 'active', 'inactive'];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE_URL);
      setUsers(response.data);
      toast.success(`✅ ${response.data.length} usuarios cargados`, {
        position: "top-right",
        autoClose: 2000
      });
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      toast.error('❌ Error al cargar usuarios', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'Todos' || user.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
        if (!value.trim()) error = 'El nombre es obligatorio';
        else if (value.trim().length < 2) error = 'El nombre debe tener al menos 2 caracteres';
        break;
      case 'lastName':
        if (!value.trim()) error = 'El apellido es obligatorio';
        else if (value.trim().length < 2) error = 'El apellido debe tener al menos 2 caracteres';
        break;
      case 'email':
        if (!value.trim()) error = 'El email es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Ingrese un email válido';
        break;
      case 'phone':
        if (value && !/^\d{10,}$/.test(value.replace(/[-\s]/g, ''))) error = 'Ingrese un teléfono válido (mínimo 10 dígitos)';
        break;
      default:
        break;
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === '';
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'El nombre es obligatorio';
    else if (formData.firstName.trim().length < 2) errors.firstName = 'El nombre debe tener al menos 2 caracteres';

    if (!formData.lastName.trim()) errors.lastName = 'El apellido es obligatorio';
    else if (formData.lastName.trim().length < 2) errors.lastName = 'El apellido debe tener al menos 2 caracteres';

    if (!formData.email.trim()) errors.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Ingrese un email válido';

    if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/[-\s]/g, ''))) errors.phone = 'Ingrese un teléfono válido (mínimo 10 dígitos)';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('❌ Por favor corrija los errores en el formulario', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        await axios.put(`${API_BASE_URL}/${editingUser.id}`, formData);
        toast.success('✅ Usuario actualizado exitosamente', {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        await axios.post(API_BASE_URL, formData);
        toast.success('✅ Usuario creado exitosamente', {
          position: "top-right",
          autoClose: 3000
        });
      }
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      const errorMessage = err.response?.data?.message || 'Error al guardar usuario';
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setViewMode(false);
    setFormErrors({});
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      hobby: user.hobby || '',
      status: user.status
    });
    setShowModal(true);
  };

  const handleView = (user) => {
    setEditingUser(user);
    setViewMode(true);
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/${userToDelete.id}`);
      
      toast.success('✅ Usuario inactivado exitosamente', {
        position: "top-right",
        autoClose: 3000
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      await fetchUsers();
    } catch (err) {
      console.error('Error al inactivar usuario:', err);
      const errorMessage = err.response?.data?.message || 'Error al inactivar usuario';
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setViewMode(false);
    setFormErrors({});
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      hobby: '',
      status: 'active'
    });
  };

  const handleExport = () => {
    try {
      const csvContent = [
        ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Ubicación', 'Hobby', 'Estado', 'Fecha'],
        ...filteredUsers.map(user => [
          user.id,
          `"${user.firstName}"`,
          `"${user.lastName}"`,
          user.email,
          user.phone || '',
          `"${user.location || ''}"`,
          `"${user.hobby || ''}"`,
          user.status === 'active' ? 'Activo' : 'Inactivo',
          user.dateCreated || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_frank_furt_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('✅ CSV exportado exitosamente', {
        position: "top-right",
        autoClose: 2000
      });
    } catch (err) {
      console.error('Error al exportar CSV:', err);
      toast.error('❌ Error al exportar CSV', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  return (
    <div className="menu-crud">
      <ToastContainer />

      <div className="header-dash">
        <div className="header-title-invent">
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios de Frank Furt</p>
        </div>
        <div className="header-actions-invent">
          <button className="btn-refresh" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
            Actualizar
          </button>
          <button className="btn-export" onClick={handleExport}>
            <Download size={20} />
            Exportar CSV
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Agregar Usuario
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter size={20} />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'Todos' ? 'Todos' : status === 'active' ? 'Activos' : 'Inactivos'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading && users.length === 0 ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={40} />
            <p>Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <h3>No se encontraron usuarios</h3>
            <p>Intenta ajustar los filtros o crea un nuevo usuario</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} />
              Crear primer usuario
            </button>
          </div>
        ) : (
          <table className="menu-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="product-info">
                      <div className="user-avatar">
                        {user.avatar || (user.firstName.charAt(0) + user.lastName.charAt(0))}
                      </div>
                      <div>
                        <div className="product-name">{user.firstName} {user.lastName}</div>
                        <div className="product-description">{user.hobby || 'Sin hobby'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.location || '-'}</td>
                  <td>
                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn-action btn-view" onClick={() => handleView(user)} title="Ver detalles">
                        <Eye size={16} />
                      </button>
                      <button className="btn-action btn-edit" onClick={() => handleEdit(user)} title="Editar usuario">
                        <Edit size={16} />
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDeleteClick(user)} title="Inactivar usuario">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <div className="modal-header-invent">
            <h2>{viewMode ? 'Detalles del Usuario' : editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
          </div>

          {viewMode ? (
            <div className="modal-form">
              <div className="user-view-container">
                <div className="user-view-avatar">
                  {editingUser.avatar || (editingUser.firstName.charAt(0) + editingUser.lastName.charAt(0))}
                </div>
                <div className="user-view-details">
                  <div className="view-group">
                    <label>Nombre Completo:</label>
                    <p>{editingUser.firstName} {editingUser.lastName}</p>
                  </div>
                  <div className="view-group">
                    <label>Email:</label>
                    <p>{editingUser.email}</p>
                  </div>
                  <div className="view-group">
                    <label>Teléfono:</label>
                    <p>{editingUser.phone || 'No especificado'}</p>
                  </div>
                  <div className="view-group">
                    <label>Ubicación:</label>
                    <p>{editingUser.location || 'No especificada'}</p>
                  </div>
                  <div className="view-group">
                    <label>Hobby:</label>
                    <p>{editingUser.hobby || 'Sin hobby'}</p>
                  </div>
                  <div className="view-group">
                    <label>Estado:</label>
                    <span className={`status-badge status-${editingUser.status.toLowerCase()}`}>
                      {editingUser.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="view-group">
                    <label>Fecha de Registro:</label>
                    <p>{editingUser.dateCreated}</p>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cerrar</button>
                <button type="button" className="btn-primary" onClick={() => { setViewMode(false); handleEdit(editingUser); }}>
                  <Edit size={18} />
                  Editar
                </button>
              </div>
            </div>
          ) : (
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({...formData, firstName: e.target.value});
                    validateField('firstName', e.target.value);
                  }}
                  onBlur={(e) => validateField('firstName', e.target.value)}
                  placeholder="Ingrese el nombre"
                  className={formErrors.firstName ? 'input-error' : ''}
                />
                {formErrors.firstName && <span className="error-message"><AlertCircle size={14} /> {formErrors.firstName}</span>}
              </div>

              <div className="form-group">
                <label>Apellido <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({...formData, lastName: e.target.value});
                    validateField('lastName', e.target.value);
                  }}
                  onBlur={(e) => validateField('lastName', e.target.value)}
                  placeholder="Ingrese el apellido"
                  className={formErrors.lastName ? 'input-error' : ''}
                />
                {formErrors.lastName && <span className="error-message"><AlertCircle size={14} /> {formErrors.lastName}</span>}
              </div>

              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    validateField('email', e.target.value);
                  }}
                  onBlur={(e) => validateField('email', e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className={formErrors.email ? 'input-error' : ''}
                />
                {formErrors.email && <span className="error-message"><AlertCircle size={14} /> {formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (e.target.value) validateField('phone', e.target.value);
                  }}
                  placeholder="3001234567"
                  className={formErrors.phone ? 'input-error' : ''}
                />
                {formErrors.phone && <span className="error-message"><AlertCircle size={14} /> {formErrors.phone}</span>}
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Ciudad, país"
                />
              </div>

              <div className="form-group">
                <label>Hobby</label>
                <input
                  type="text"
                  value={formData.hobby}
                  onChange={(e) => setFormData({...formData, hobby: e.target.value})}
                  placeholder="Deportes, lectura, etc."
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="spinning" size={18} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      {editingUser ? 'Actualizar' : 'Crear'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {showDeleteModal && (
        <Modal onClose={cancelDelete}>
          <div className="modal-header-delete">
            <AlertCircle size={48} color="#E74C3C" />
            <h2>¿Inactivar Usuario?</h2>
          </div>
          <div className="modal-body-delete">
            <p>
              ¿Estás seguro de que deseas inactivar al usuario{' '}
              <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
            </p>
            <p className="warning-text">
              ⚠️ El usuario no podrá acceder al sistema. No se puede inactivar usuarios con pedidos activos.
            </p>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={cancelDelete} disabled={loading}>
              Cancelar
            </button>
            <button type="button" className="btn-delete-confirm" onClick={confirmDelete} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="spinning" size={18} />
                  Inactivando...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Sí, Inactivar
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersCrud;
