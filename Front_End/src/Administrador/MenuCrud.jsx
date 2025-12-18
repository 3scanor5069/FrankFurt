// MenuCrud.jsx - CORREGIDO con Categorías de BD y Carga de Archivos
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Filter, Download, Eye, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MenuCrud.css';

const MenuCrud = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hamburguesas',
    menu: 'Menú Principal',
    price: '',
    description: '',
    status: 'Activo',
    stock_limite: '10',
    especial_dia: false,
    image: ''
  });

  // URL base para la API. Lee la variable de entorno REACT_APP_API_URL (sin sufijo /api).
  // Si no está definida, se utiliza 'http://localhost:3006'.
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';

  // Categorías reales de la base de datos
  const categories = ['Todos', 'Hamburguesas', 'Bebidas', 'Papas', 'Postres', 'Acompañamientos'];

  // ===================================================================
  // 🔄 OBTENER PRODUCTOS DEL BACKEND
  // ===================================================================
  const fetchMenuItems = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`);
      const data = await res.json();
      setMenuItems(data);
      
      if (showToast) {
        toast.success(`✅ ${data.length} productos cargados`, {
          position: "top-right",
          autoClose: 2000
        });
      }
    } catch (err) {
      console.error('Error al cargar menú:', err);
      if (showToast) {
        toast.error('❌ Error al cargar productos. Intente nuevamente.', {
          position: "top-right",
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems(false);
  }, [fetchMenuItems]);

  // ===================================================================
  // 🔍 FILTRAR PRODUCTOS
  // ===================================================================
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  // ===================================================================
  // 🖼️ MANEJAR SELECCIÓN DE IMAGEN
  // ===================================================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('❌ Solo se permiten imágenes (JPG, PNG, WEBP, GIF)', {
          position: "top-right",
          autoClose: 3000
        });
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('❌ La imagen no debe superar 2MB', {
          position: "top-right",
          autoClose: 3000
        });
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ===================================================================
  // ✅ VALIDACIÓN DE FORMULARIO
  // ===================================================================
  const validateField = useCallback((name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        }
        break;
      case 'price':
        if (!value) {
          error = 'El precio es obligatorio';
        } else if (parseFloat(value) <= 0) {
          error = 'El precio debe ser mayor a 0';
        }
        break;
      default:
        break;
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === '';
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.price) {
      errors.price = 'El precio es obligatorio';
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // ===================================================================
  // 💾 CREAR / ACTUALIZAR PRODUCTO
  // ===================================================================
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
      // Si hay imagen seleccionada, convertir a base64
      let imageData = formData.image;
      if (selectedImage) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(selectedImage);
        });
      }

      const dataToSend = {
        ...formData,
        image: imageData
      };

      let response;
      if (editingItem) {
        response = await fetch(`${API_BASE_URL}/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar producto');
      }

      const data = await response.json();
      
      toast.success(`✅ ${data.message || (editingItem ? 'Producto actualizado' : 'Producto creado') + ' exitosamente'}`, {
        position: "top-right",
        autoClose: 3000
      });

      await fetchMenuItems(false);
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      toast.error(`❌ ${err.message}`, {
        position: "top-right",
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // ===================================================================
  // ✏️ EDITAR PRODUCTO
  // ===================================================================
  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setViewMode(false);
    setFormErrors({});
    setSelectedImage(null);
    setImagePreview(item.image || '');
    setFormData({
      name: item.name,
      category: item.category,
      menu: 'Menú Principal',
      price: item.price.toString(),
      description: item.description,
      status: item.status,
      stock_limite: item.stock_limite?.toString() || '10',
      especial_dia: item.especial_dia || false,
      image: item.image || ''
    });
    setShowModal(true);
  }, []);

  // ===================================================================
  // 👁️ VER DETALLES
  // ===================================================================
  const handleView = useCallback((item) => {
    setEditingItem(item);
    setViewMode(true);
    setShowModal(true);
  }, []);

  // ===================================================================
  // 🗑️ ELIMINAR PRODUCTO
  // ===================================================================
  const handleDeleteClick = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/${itemToDelete.id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al inactivar producto');
      }

      await fetchMenuItems(false);
      
      toast.success('✅ Producto inactivado exitosamente', {
        position: "top-right",
        autoClose: 3000
      });
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error al inactivar producto:', err);
      toast.error(`❌ ${err.message}`, {
        position: "top-right",
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }, []);

  // ===================================================================
  // ❌ CERRAR MODAL
  // ===================================================================
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setViewMode(false);
    setFormErrors({});
    setSelectedImage(null);
    setImagePreview('');
    setFormData({
      name: '',
      category: 'Hamburguesas',
      menu: 'Menú Principal',
      price: '',
      description: '',
      status: 'Activo',
      stock_limite: '10',
      especial_dia: false,
      image: ''
    });
  }, []);

  // ===================================================================
  // 📥 EXPORTAR CSV
  // ===================================================================
  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        ['ID', 'Nombre', 'Categoría', 'Menú', 'Precio', 'Descripción', 'Estado'],
        ...filteredItems.map(item => [
          item.id,
          `"${item.name}"`,
          item.category,
          item.menu,
          item.price,
          `"${item.description}"`,
          item.status
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu_frank_furt_${new Date().toISOString().split('T')[0]}.csv`;
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
  }, [filteredItems]);

  const handleRefresh = useCallback(() => {
    fetchMenuItems(true);
  }, [fetchMenuItems]);

  // ===================================================================
  // 🎨 RENDERIZADO
  // ===================================================================
  return (
    <div className="menu-crud">
      <ToastContainer limit={3} />

      {/* Header */}
      <div className="header-dash">
        <div className="header-title-invent">
          <h1>Gestión de Menú</h1>
          <p>Administra los productos de Frank Furt</p>
        </div>
        <div className="header-actions-invent">
          <button 
            className="btn-refresh" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
            Actualizar
          </button>
          <button className="btn-export" onClick={handleExport}>
            <Download size={20} />
            Exportar CSV
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar productos por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        {loading && menuItems.length === 0 ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={40} />
            <p>Cargando productos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros o crea un nuevo producto</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} />
              Crear primer producto
            </button>
          </div>
        ) : (
          <table className="menu-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Menú</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <div className="product-info">
                      <img 
                        src={item.image || 'https://via.placeholder.com/60x48?text=Sin+Imagen'} 
                        alt={item.name} 
                        className="product-image"
                        loading="lazy"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = 'https://via.placeholder.com/60x48?text=Error';
                        }}
                      />
                      <div>
                        <div className="product-name">{item.name}</div>
                        <div className="product-description">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge category-${item.category.toLowerCase()}`}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.menu}</td>
                  <td className="price">${item.price.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn-action btn-view" 
                        onClick={() => handleView(item)}
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEdit(item)}
                        title="Editar producto"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDeleteClick(item)}
                        title="Eliminar producto"
                      >
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

      {/* Modal de Edición/Creación/Vista */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-invent">
              <h2>
                {viewMode 
                  ? 'Detalles del Producto' 
                  : editingItem 
                    ? 'Editar Producto' 
                    : 'Agregar Producto'
                }
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            {viewMode ? (
              <div className="modal-form">
                <div className="product-view-container">
                  <div className="product-view-image">
                    <img 
                      src={editingItem.image || 'https://via.placeholder.com/200x160?text=Sin+Imagen'} 
                      alt={editingItem.name}
                      loading="lazy"
                      onError={(e) => { 
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200x160?text=Error';
                      }}
                    />
                  </div>
                  <div className="product-view-details">
                    <div className="view-group">
                      <label>Nombre:</label>
                      <p>{editingItem.name}</p>
                    </div>
                    <div className="view-group">
                      <label>Categoría:</label>
                      <span className={`category-badge category-${editingItem.category.toLowerCase()}`}>
                        {editingItem.category}
                      </span>
                    </div>
                    <div className="view-group">
                      <label>Menú:</label>
                      <p>{editingItem.menu}</p>
                    </div>
                    <div className="view-group">
                      <label>Precio:</label>
                      <p className="price">${editingItem.price.toLocaleString()}</p>
                    </div>
                    <div className="view-group">
                      <label>Descripción:</label>
                      <p>{editingItem.description || 'Sin descripción'}</p>
                    </div>
                    <div className="view-group">
                      <label>Estado:</label>
                      <span className={`status-badge status-${editingItem.status.toLowerCase()}`}>
                        {editingItem.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Cerrar
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={() => {
                      setViewMode(false);
                      handleEdit(editingItem);
                    }}
                  >
                    <Edit size={18} />
                    Editar
                  </button>
                </div>
              </div>
            ) : (
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    Nombre del Producto <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      validateField('name', e.target.value);
                    }}
                    onBlur={(e) => validateField('name', e.target.value)}
                    placeholder="Ej: Hamburguesa Clásica"
                    className={formErrors.name ? 'input-error' : ''}
                  />
                  {formErrors.name && (
                    <span className="error-message">
                      <AlertCircle size={14} /> {formErrors.name}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Categoría <span className="required">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Hamburguesas">Hamburguesas</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Papas">Papas</option>
                    <option value="Postres">Postres</option>
                    <option value="Acompañamientos">Acompañamientos</option>
                  </select>
                  <small style={{color: '#64748B', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                    Seleccione la categoría del producto
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    Menú
                  </label>
                  <input
                    type="text"
                    value="Menú Principal"
                    disabled
                    style={{backgroundColor: '#F8F9FA', cursor: 'not-allowed'}}
                  />
                  <small style={{color: '#64748B', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                    Todos los productos pertenecen al Menú Principal
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    Precio <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({...formData, price: e.target.value});
                      validateField('price', e.target.value);
                    }}
                    onBlur={(e) => validateField('price', e.target.value)}
                    placeholder="0.00"
                    className={formErrors.price ? 'input-error' : ''}
                  />
                  {formErrors.price && (
                    <span className="error-message">
                      <AlertCircle size={14} /> {formErrors.price}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del producto"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Stock Límite <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_limite}
                    onChange={(e) => setFormData({...formData, stock_limite: e.target.value})}
                    placeholder="10"
                  />
                  <small style={{color: '#64748B', fontSize: '12px'}}>
                    Stock mínimo de seguridad para alertas
                  </small>
                </div>

                <div className="form-group">
                  <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                      type="checkbox"
                      checked={formData.especial_dia}
                      onChange={(e) => setFormData({...formData, especial_dia: e.target.checked})}
                      style={{width: 'auto', margin: 0}}
                    />
                    <span>Marcar como Especial del Día</span>
                  </label>
                  <small style={{color: '#64748B', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                    Los productos especiales aparecerán destacados en el menú
                  </small>
                </div>

                <div className="form-group">
                  <label>Imagen del Producto</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    style={{padding: '8px'}}
                  />
                  <small style={{color: '#64748B', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                    Formatos aceptados: JPG, PNG, WEBP, GIF (máx. 2MB)
                  </small>
                  {selectedImage && (
                    <small style={{color: '#10B981', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                      ✓ Archivo seleccionado: {selectedImage.name}
                    </small>
                  )}
                  {imagePreview && (
                    <div className="image-preview">
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="spinning" size={18} />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        {editingItem ? 'Actualizar' : 'Crear'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Inactivación */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-delete">
              <AlertCircle size={48} color="#E74C3C" />
              <h2>¿Inactivar Producto?</h2>
            </div>
            <div className="modal-body-delete">
              <p>
                ¿Estás seguro de que deseas inactivar el producto{' '}
                <strong>{itemToDelete?.name}</strong>?
              </p>
              <p className="warning-text">
                ⚠️ El producto no estará disponible para la venta hasta que lo reactives.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={cancelDelete}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-delete-confirm" 
                onClick={confirmDelete}
                disabled={loading}
              >
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuCrud;
