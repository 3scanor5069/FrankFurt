import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductoCard from '../components/ProductoCard';
import { mesasAPI, productosAPI, ordenesAPI } from '../services/api.js';
import '../styles/RegistroOrden.css';

const RegistroOrden = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  
  const [mesa, setMesa] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [ordenActual, setOrdenActual] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardandoOrden, setGuardandoOrden] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [mesaId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar mesa, productos y categorías en paralelo
      const [mesaResponse, productosResponse, categoriasResponse] = await Promise.all([
        mesasAPI.obtenerMesa(mesaId),
        productosAPI.obtenerProductos(),
        productosAPI.obtenerCategorias()
      ]);

      setMesa(mesaResponse.data);
      setProductos(productosResponse.data);
      setCategorias(categoriasResponse.data);
      
      if (categoriasResponse.data.length > 0) {
        setCategoriaSeleccionada(categoriasResponse.data[0]);
      }
    } catch (err) {
      setError('Error cargando los datos. Por favor, intenta nuevamente.');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const agregarProducto = (item) => {
    setOrdenActual(prevOrden => {
      const itemExistente = prevOrden.find(
        orden => orden.producto_id === item.producto_id
      );

      if (itemExistente) {
        // Si el producto ya existe, actualizar la cantidad
        return prevOrden.map(orden =>
          orden.producto_id === item.producto_id
            ? { ...orden, cantidad: orden.cantidad + item.cantidad }
            : orden
        );
      } else {
        // Si es un producto nuevo, agregarlo
        return [...prevOrden, item];
      }
    });
  };

  const eliminarProducto = (productoId) => {
    setOrdenActual(prevOrden => 
      prevOrden.filter(item => item.producto_id !== productoId)
    );
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productoId);
      return;
    }

    setOrdenActual(prevOrden =>
      prevOrden.map(item =>
        item.producto_id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  const calcularTotal = () => {
    return ordenActual.reduce((total, item) => {
      return total + (item.precio_unitario * item.cantidad);
    }, 0);
  };

  const guardarOrden = async () => {
    if (ordenActual.length === 0) {
      alert('Debe agregar al menos un producto a la orden');
      return;
    }

    try {
      setGuardandoOrden(true);
      
      const ordenData = {
        items: ordenActual
      };

      const response = await ordenesAPI.crearOrden(mesaId, ordenData);
      
      // Redirigir a la visualización de la orden
      navigate(`/orden/${response.data.id}`);
    } catch (err) {
      setError('Error guardando la orden. Por favor, intenta nuevamente.');
      console.error('Error guardando orden:', err);
    } finally {
      setGuardandoOrden(false);
    }
  };

  const volverAMesas = () => {
    navigate('/');
  };

  const productosFiltrados = productos.filter(producto => 
    categoriaSeleccionada === '' || producto.categoria === categoriaSeleccionada
  );

  if (loading) {
    return (
      <div className="registro-orden">
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="registro-orden">
        <div className="error-message">
          {error}
          <button className="btn btn-primary" onClick={cargarDatos} style={{ marginLeft: '10px' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!mesa) {
    return (
      <div className="registro-orden">
        <div className="error-message">
          Mesa no encontrada
          <button className="btn btn-primary" onClick={volverAMesas} style={{ marginLeft: '10px' }}>
            Volver a Mesas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registro-orden">
      <div className="orden-header">
        <div className="mesa-info">
          <h1 className="page-title">Mesa {mesa.numero}</h1>
          <p className="mesa-detalles">
            Capacidad: {mesa.capacidad} personas • Estado: 
            <span className={`estado ${mesa.estado}`}> {mesa.estado}</span>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={volverAMesas}>
          ← Volver a Mesas
        </button>
      </div>

      <div className="orden-content">
        <div className="menu-section">
          <div className="menu-header">
            <h2>Menú</h2>
            <div className="categorias-filtro">
              <button
                className={`categoria-btn ${categoriaSeleccionada === '' ? 'active' : ''}`}
                onClick={() => setCategoriaSeleccionada('')}
              >
                Todos
              </button>
              {categorias.map(categoria => (
                <button
                  key={categoria}
                  className={`categoria-btn ${categoriaSeleccionada === categoria ? 'active' : ''}`}
                  onClick={() => setCategoriaSeleccionada(categoria)}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>

          <div className="productos-grid">
            {productosFiltrados.map(producto => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onAgregar={agregarProducto}
              />
            ))}
          </div>
        </div>

        <div className="orden-sidebar">
          <div className="orden-resumen">
            <h3>Resumen de Orden</h3>
            
            {ordenActual.length === 0 ? (
              <div className="orden-vacia">
                <div className="orden-vacia-icon">🛒</div>
                <p>No hay productos en la orden</p>
                <p className="orden-vacia-subtitle">Agrega productos del menú</p>
              </div>
            ) : (
              <>
                <div className="orden-items">
                  {ordenActual.map(item => (
                    <div key={item.producto_id} className="orden-item">
                      <div className="item-info">
                        <h4 className="item-nombre">{item.producto_nombre}</h4>
                        <p className="item-precio">${item.precio_unitario.toFixed(2)} c/u</p>
                      </div>
                      <div className="item-controls">
                        <div className="cantidad-control">
                          <button 
                            className="cantidad-btn-small"
                            onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                          >
                            -
                          </button>
                          <span className="cantidad">{item.cantidad}</span>
                          <button 
                            className="cantidad-btn-small"
                            onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="item-subtotal">
                          ${(item.precio_unitario * item.cantidad).toFixed(2)}
                        </div>
                        <button 
                          className="eliminar-btn"
                          onClick={() => eliminarProducto(item.producto_id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="orden-total">
                  <div className="total-line">
                    <span>Total:</span>
                    <span className="total-amount">${calcularTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  className={`btn btn-primary guardar-orden-btn ${guardandoOrden ? 'loading' : ''}`}
                  onClick={guardarOrden}
                  disabled={guardandoOrden}
                >
                  {guardandoOrden ? 'Guardando...' : 'Confirmar Orden'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroOrden;