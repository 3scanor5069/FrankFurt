// ========================================
// 🍔 MANUAL SALE COMPONENT - DEFINITIVO
// Frank Furt TPV System
// ========================================
// Componente completo con modal de personalización
// ========================================

import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ManualSale.css';

const ManualSale = () => {
  // ==========================================
  // 📋 ESTADOS PRINCIPALES
  // ==========================================
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [personalizaciones, setPersonalizaciones] = useState([]);
  const [personalizacionesAgrupadas, setPersonalizacionesAgrupadas] = useState({});
  const [carrito, setCarrito] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState(null);

  // URL base para el backend. Utiliza la variable de entorno REACT_APP_API_URL o
  // por defecto 'http://localhost:3006'. Todos los llamados a la API se basan en esta ruta.
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';

  // ==========================================
  // 📋 ESTADOS DEL MODAL DE PERSONALIZACIÓN
  // ==========================================
  const [modalPersonalizacion, setModalPersonalizacion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [personalizacionesSeleccionadas, setPersonalizacionesSeleccionadas] = useState([]);
  const [notasPersonalizacion, setNotasPersonalizacion] = useState('');

  // ==========================================
  // 🔄 CARGAR DATOS AL MONTAR
  // ==========================================
  useEffect(() => {
    cargarDatosIniciales();
    const interval = setInterval(cargarEstadisticas, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    await Promise.all([
      cargarProductos(),
      cargarMesas(),
      cargarCategorias(),
      cargarPersonalizaciones(),
      cargarEstadisticas()
    ]);
    setLoading(false);
  };

  // ==========================================
  // 📡 FUNCIONES DE CARGA DE DATOS
  // ==========================================
  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manualSale/estadisticas`);
      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarMesas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manualSale/mesas`);
      if (!response.ok) throw new Error('Error al cargar mesas');
      const data = await response.json();
      setMesas(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las mesas');
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manualSale/productos`);
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProductos(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los productos');
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manualSale/categorias`);
      if (!response.ok) throw new Error('Error al cargar categorías');
      const data = await response.json();
      setCategorias(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarPersonalizaciones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manualSale/personalizaciones`);
      if (!response.ok) throw new Error('Error al cargar personalizaciones');
      const data = await response.json();
      setPersonalizaciones(data.data);
      setPersonalizacionesAgrupadas(data.agrupadas || {});
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las personalizaciones');
    }
  };

  // ==========================================
  // 🛒 FUNCIONES DEL CARRITO
  // ==========================================
  const agregarAlCarrito = (producto) => {
    if (producto.stock <= 0) {
      toast.error('Producto sin stock disponible');
      return;
    }

    const productoExistente = carrito.find(item => 
      item.idProducto === producto.idProducto && 
      !item.personalizaciones
    );
    
    if (productoExistente) {
      if (productoExistente.cantidad >= producto.stock) {
        toast.error('Stock insuficiente');
        return;
      }
      setCarrito(carrito.map(item =>
        item === productoExistente
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
      toast.success(`+1 ${producto.nombre}`);
    } else {
      const nuevoItem = {
        id: Date.now(), // ID temporal único para cada item del carrito
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        stockDisponible: producto.stock,
        personalizaciones: null,
        notas: null
      };
      setCarrito([...carrito, nuevoItem]);
      toast.success(`${producto.nombre} agregado`);
    }
  };

  const modificarCantidad = (itemCarrito, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(itemCarrito);
      return;
    }

    if (nuevaCantidad > itemCarrito.stockDisponible) {
      toast.error('Stock insuficiente');
      return;
    }

    setCarrito(carrito.map(item =>
      item.id === itemCarrito.id
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const eliminarDelCarrito = (itemCarrito) => {
    setCarrito(carrito.filter(item => item.id !== itemCarrito.id));
    toast.info(`${itemCarrito.nombre} eliminado`);
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      let precioItem = item.precio;
      
      // Sumar precios de personalizaciones
      if (item.personalizaciones && item.personalizaciones.length > 0) {
        const costoPersonalizaciones = item.personalizaciones.reduce((sum, pers) => {
          return sum + (parseFloat(pers.precio_adicional) || 0);
        }, 0);
        precioItem += costoPersonalizaciones;
      }
      
      return total + (precioItem * item.cantidad);
    }, 0);
  };

  // ==========================================
  // 🎨 FUNCIONES DEL MODAL DE PERSONALIZACIÓN
  // ==========================================
  const abrirModalPersonalizacion = (itemCarrito) => {
    setProductoEditando(itemCarrito);
    setPersonalizacionesSeleccionadas(itemCarrito.personalizaciones || []);
    setNotasPersonalizacion(itemCarrito.notas || '');
    setModalPersonalizacion(true);
  };

  const cerrarModalPersonalizacion = () => {
    setModalPersonalizacion(false);
    setProductoEditando(null);
    setPersonalizacionesSeleccionadas([]);
    setNotasPersonalizacion('');
  };

  const togglePersonalizacion = (pers) => {
    const existe = personalizacionesSeleccionadas.find(
      p => p.idPersonalizacion === pers.idPersonalizacion
    );

    if (existe) {
      setPersonalizacionesSeleccionadas(
        personalizacionesSeleccionadas.filter(
          p => p.idPersonalizacion !== pers.idPersonalizacion
        )
      );
    } else {
      setPersonalizacionesSeleccionadas([...personalizacionesSeleccionadas, pers]);
    }
  };

  const guardarPersonalizacion = () => {
    if (!productoEditando) return;

    // Actualizar el item en el carrito con las personalizaciones
    setCarrito(carrito.map(item => 
      item.id === productoEditando.id
        ? {
            ...item,
            personalizaciones: personalizacionesSeleccionadas.length > 0 ? personalizacionesSeleccionadas : null,
            notas: notasPersonalizacion.trim() || null
          }
        : item
    ));

    toast.success('Personalización guardada');
    cerrarModalPersonalizacion();
  };

  // ==========================================
  // 📤 CONFIRMAR PEDIDO
  // ==========================================
  const confirmarPedido = async () => {
    if (!mesaSeleccionada) {
      toast.error('Debe seleccionar una mesa');
      return;
    }

    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    // Confirmación
    const mesaInfo = mesas.find(m => m.idMesa === parseInt(mesaSeleccionada));
    const confirmar = window.confirm(
      `¿Confirmar pedido para ${mesaInfo?.numero}?\n` +
      `Total: $${calcularTotal().toLocaleString()}\n` +
      `Items: ${carrito.reduce((sum, p) => sum + p.cantidad, 0)}`
    );

    if (!confirmar) return;

    setLoading(true);

    try {
      // Formatear productos para el backend
      const productosFormateados = carrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        personalizaciones: item.personalizaciones 
          ? item.personalizaciones.map(p => p.idPersonalizacion)
          : [],
        notas: item.notas
      }));

      const pedidoData = {
        idMesa: parseInt(mesaSeleccionada),
        idSede: 1,
        idUsuario: 1,
        productos: productosFormateados
      };

      const response = await fetch(`${API_BASE_URL}/api/manualSale/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `✅ Pedido #${result.data.idPedido} registrado - Total: $${result.data.total.toLocaleString()}`,
          { autoClose: 5000 }
        );
        // Limpiar
        setCarrito([]);
        setMesaSeleccionada('');
        // Recargar datos
        await Promise.all([cargarMesas(), cargarProductos(), cargarEstadisticas()]);
      } else {
        const errorMsg = result.error || 'Error al registrar el pedido';
        toast.error(errorMsg);
        
        // Si es error de stock, mostrar detalles
        if (result.code === 'INSUFFICIENT_STOCK' && result.producto) {
          toast.error(
            `Stock insuficiente: ${result.producto} (Disponible: ${result.disponible})`
          );
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const limpiarCarrito = () => {
    if (carrito.length > 0) {
      if (window.confirm('¿Limpiar el carrito?')) {
        setCarrito([]);
        toast.info('Carrito limpiado');
      }
    }
  };

  // ==========================================
  // 🔍 FILTRAR PRODUCTOS
  // ==========================================
  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = !categoriaFiltro || p.categoria === categoriaFiltro;
    const coincideBusqueda = !busqueda || 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const mesaActual = mesas.find(m => m.idMesa === parseInt(mesaSeleccionada));

  // ==========================================
  // 🎨 RENDER
  // ==========================================
  return (
    <div className="manual-sale-container">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header */}
      <div className="manual-sale-header">
        <div className="header-title">
          <h1>🍔 Venta Manual - Frank Furt</h1>
          {estadisticas && (
            <div className="estadisticas-header">
              <span>📊 Pedidos Hoy: {estadisticas.totalPedidosHoy}</span>
              <span>💰 Ventas: ${parseFloat(estadisticas.ventasTotalesHoy || 0).toLocaleString()}</span>
              <span>🪑 Mesas: {estadisticas.mesasDisponibles} disponibles</span>
            </div>
          )}
        </div>

        <div className="mesa-selector">
          <label htmlFor="mesa">Mesa:</label>
          <select
            id="mesa"
            value={mesaSeleccionada}
            onChange={(e) => setMesaSeleccionada(e.target.value)}
            disabled={loading}
            className="select-mesa"
          >
            <option value="">Selecciona una mesa</option>
            {mesas.map(mesa => (
              <option 
                key={mesa.idMesa} 
                value={mesa.idMesa}
                disabled={mesa.estado !== 'disponible'}
              >
                {mesa.numero} {mesa.estado !== 'disponible' ? '(Ocupada)' : ''}
              </option>
            ))}
          </select>
          {mesaActual && (
            <span className={`estado-mesa ${mesaActual.estado}`}>
              {mesaActual.estado === 'disponible' ? '✓ Disponible' : '✕ Ocupada'}
            </span>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="manual-sale-content">
        {/* Sección de Productos */}
        <div className="productos-section">
          <div className="productos-header">
            <h2>Productos Disponibles</h2>
            <div className="filtros-container">
              <div className="busqueda-input">
                <input
                  type="text"
                  placeholder="🔍 Buscar producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="input-busqueda"
                />
              </div>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="select-categoria"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre} ({cat.cantidadProductos})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="productos-grid">
            {loading ? (
              <div className="loading-productos">
                <div className="spinner"></div>
                <p>Cargando productos...</p>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <p className="no-productos">
                {busqueda || categoriaFiltro 
                  ? 'No se encontraron productos con esos filtros' 
                  : 'No hay productos disponibles'}
              </p>
            ) : (
              productosFiltrados.map(producto => (
                <div 
                  key={producto.idProducto} 
                  className={`producto-card ${producto.stock <= 0 ? 'sin-stock' : ''}`}
                >
                  <div className="producto-badge">{producto.categoria}</div>
                  <h3 className="producto-nombre">{producto.nombre}</h3>
                  {producto.descripcion && (
                    <p className="producto-descripcion">{producto.descripcion}</p>
                  )}
                  <div className="producto-footer">
                    <div className="producto-info">
                      <p className="precio">${producto.precio.toLocaleString()}</p>
                      <p className={`stock ${producto.stock <= 5 ? 'stock-bajo' : ''}`}>
                        Stock: {producto.stock}
                      </p>
                    </div>
                    <button
                      className="btn-agregar"
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={producto.stock <= 0 || loading}
                    >
                      {producto.stock <= 0 ? 'Sin Stock' : '+ Agregar'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sección del Carrito */}
        <div className="carrito-section">
          <div className="carrito-header">
            <h2>🛒 Pedido Actual</h2>
            {carrito.length > 0 && (
              <button 
                className="btn-limpiar-carrito"
                onClick={limpiarCarrito}
                disabled={loading}
                title="Limpiar carrito"
              >
                🗑️ Limpiar
              </button>
            )}
          </div>

          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <p>🛒 El carrito está vacío</p>
              <small>Selecciona productos para comenzar</small>
            </div>
          ) : (
            <div className="carrito-contenido">
              <div className="carrito-items">
                {carrito.map(item => {
                  // Calcular precio con personalizaciones
                  const costoPersonalizaciones = item.personalizaciones
                    ? item.personalizaciones.reduce((sum, p) => sum + parseFloat(p.precio_adicional || 0), 0)
                    : 0;
                  const precioConPersonalizacion = item.precio + costoPersonalizaciones;

                  return (
                    <div key={item.id} className="carrito-item">
                      <div className="item-info">
                        <h4>{item.nombre}</h4>
                        <p className="item-precio">
                          ${item.precio.toLocaleString()}
                          {costoPersonalizaciones > 0 && (
                            <span className="precio-personalizacion">
                              {' '}+ ${costoPersonalizaciones.toLocaleString()}
                            </span>
                          )}
                        </p>
                        {item.personalizaciones && item.personalizaciones.length > 0 && (
                          <div className="personalizaciones-mini">
                            {item.personalizaciones.map(p => (
                              <span key={p.idPersonalizacion} className="pers-tag">
                                {p.nombre}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.notas && (
                          <p className="notas-mini">📝 {item.notas}</p>
                        )}
                      </div>
                      <div className="cantidad-controls">
                        <button
                          onClick={() => modificarCantidad(item, item.cantidad - 1)}
                          disabled={loading}
                          className="btn-cantidad"
                        >
                          −
                        </button>
                        <span className="cantidad-display">{item.cantidad}</span>
                        <button
                          onClick={() => modificarCantidad(item, item.cantidad + 1)}
                          disabled={loading || item.cantidad >= item.stockDisponible}
                          className="btn-cantidad"
                        >
                          +
                        </button>
                      </div>
                      <div className="item-subtotal">
                        ${(precioConPersonalizacion * item.cantidad).toLocaleString()}
                      </div>
                      <button
                        className="btn-personalizar"
                        onClick={() => abrirModalPersonalizacion(item)}
                        disabled={loading}
                        title="Personalizar producto"
                      >
                        ⚙️
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={() => eliminarDelCarrito(item)}
                        disabled={loading}
                        title="Eliminar del carrito"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <div className="carrito-resumen">
                <div className="resumen-detalles">
                  <div className="detalle-linea">
                    <span>Productos:</span>
                    <span>{carrito.length}</span>
                  </div>
                  <div className="detalle-linea">
                    <span>Unidades:</span>
                    <span>{carrito.reduce((sum, item) => sum + item.cantidad, 0)}</span>
                  </div>
                  <div className="detalle-linea total-linea">
                    <span>Total:</span>
                    <span className="total-precio">${calcularTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                className="btn-confirmar"
                onClick={confirmarPedido}
                disabled={loading || !mesaSeleccionada}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Procesando...
                  </>
                ) : (
                  <>✓ Confirmar Pedido</>
                )}
              </button>

              {!mesaSeleccionada && carrito.length > 0 && (
                <p className="advertencia-mesa">⚠️ Selecciona una mesa para continuar</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Personalización */}
      {modalPersonalizacion && (
        <div className="modal-overlay" onClick={cerrarModalPersonalizacion}>
          <div className="modal-personalizacion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pers">
              <h3>⚙️ Personalizar: {productoEditando?.nombre}</h3>
              <button className="btn-cerrar-modal" onClick={cerrarModalPersonalizacion}>
                ✕
              </button>
            </div>

            <div className="modal-body-pers">
              {Object.keys(personalizacionesAgrupadas).length === 0 ? (
                <p className="no-personalizaciones">No hay personalizaciones disponibles</p>
              ) : (
                Object.entries(personalizacionesAgrupadas).map(([categoria, lista]) => (
                  <div key={categoria} className="grupo-personalizaciones">
                    <h4 className="categoria-titulo">{categoria}</h4>
                    <div className="opciones-personalizaciones">
                      {lista.map(pers => (
                        <label key={pers.idPersonalizacion} className="opcion-pers">
                          <input
                            type="checkbox"
                            checked={personalizacionesSeleccionadas.some(
                              p => p.idPersonalizacion === pers.idPersonalizacion
                            )}
                            onChange={() => togglePersonalizacion(pers)}
                          />
                          <span className="pers-nombre">{pers.nombre}</span>
                          {pers.precio_adicional > 0 && (
                            <span className="pers-precio">+${pers.precio_adicional.toLocaleString()}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}

              <div className="notas-personalizacion">
                <label>Notas adicionales:</label>
                <textarea
                  rows="3"
                  placeholder="Ej: Sin cebolla, extra salsa..."
                  value={notasPersonalizacion}
                  onChange={(e) => setNotasPersonalizacion(e.target.value)}
                  maxLength={200}
                />
                <small>{notasPersonalizacion.length}/200</small>
              </div>
            </div>

            <div className="modal-footer-pers">
              <button className="btn-cancelar-modal" onClick={cerrarModalPersonalizacion}>
                Cancelar
              </button>
              <button className="btn-guardar-modal" onClick={guardarPersonalizacion}>
                ✓ Guardar Personalización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualSale;