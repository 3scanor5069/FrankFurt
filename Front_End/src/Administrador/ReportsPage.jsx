import React, { useState, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  Package,
  Users,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Award
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import HeaderDashboard from '../components/HeaderDashboard';
import Footer from '../components/Footer';
import '../styles/ReportsPage.css';

// Construye la URL base para la API usando la variable de entorno REACT_APP_API_URL.
// Si no existe, se asume que el backend corre en localhost:3006.
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3006'}/api`;

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  
  // Estados para cada tipo de reporte
  const [salesReport, setSalesReport] = useState({
    totalVentas: 0,
    ventasHoy: 0,
    ventasSemana: 0,
    ventasMes: 0,
    pedidosPorEstado: {
      pendiente: 0,
      en_preparacion: 0,
      entregado: 0,
      pagado: 0
    },
    ventasPorDia: []
  });

  const [productsReport, setProductsReport] = useState({
    masVendidos: [],
    menosVendidos: [],
    sinVentas: []
  });

  const [frequentClientsReport, setFrequentClientsReport] = useState([]);

  // ========================================
  // CARGAR REPORTES
  // ========================================
  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSalesReport(),
        loadProductsReport(),
        loadFrequentClientsReport()
      ]);
      toast.success('Reportes cargados correctamente');
    } catch (error) {
      console.error('Error cargando reportes:', error);
      toast.error('Error al cargar algunos reportes');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // REPORTE DE VENTAS
  // ========================================
  const loadSalesReport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/reports/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSalesReport(data);
      }
    } catch (error) {
      console.error('Error cargando reporte de ventas:', error);
    }
  };

  // ========================================
  // REPORTE DE PRODUCTOS
  // ========================================
  const loadProductsReport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/reports/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProductsReport(data);
      }
    } catch (error) {
      console.error('Error cargando reporte de productos:', error);
    }
  };

  // ========================================
  // REPORTE DE CLIENTES FRECUENTES
  // ========================================
  const loadFrequentClientsReport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/reports/frequent-clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFrequentClientsReport(data);
      }
    } catch (error) {
      console.error('Error cargando reporte de clientes frecuentes:', error);
    }
  };

  // ========================================
  // EXPORTAR A PDF - VENTAS
  // ========================================
  const exportSalesReportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Reporte de Ventas', 14, 22);
    
    // Fecha
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 30);
    
    // Resumen
    doc.setFontSize(14);
    doc.text('Resumen de Ventas', 14, 45);
    
    doc.autoTable({
      startY: 50,
      head: [['Concepto', 'Valor']],
      body: [
        ['Total Ventas', `$${salesReport.totalVentas.toLocaleString('es-CO')}`],
        ['Ventas Hoy', `$${salesReport.ventasHoy.toLocaleString('es-CO')}`],
        ['Ventas Esta Semana', `$${salesReport.ventasSemana.toLocaleString('es-CO')}`],
        ['Ventas Este Mes', `$${salesReport.ventasMes.toLocaleString('es-CO')}`],
      ],
    });
    
    // Pedidos por estado
    doc.text('Pedidos por Estado', 14, doc.lastAutoTable.finalY + 15);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Estado', 'Cantidad']],
      body: [
        ['Pendiente', salesReport.pedidosPorEstado.pendiente],
        ['En Preparación', salesReport.pedidosPorEstado.en_preparacion],
        ['Entregado', salesReport.pedidosPorEstado.entregado],
        ['Pagado', salesReport.pedidosPorEstado.pagado],
      ],
    });
    
    doc.save(`reporte-ventas-${new Date().getTime()}.pdf`);
    toast.success('Reporte de ventas exportado correctamente');
  };

  // ========================================
  // EXPORTAR A PDF - PRODUCTOS
  // ========================================
  const exportProductsReportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Reporte de Productos', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 30);
    
    // Productos más vendidos
    doc.setFontSize(14);
    doc.text('Productos Más Vendidos', 14, 45);
    
    doc.autoTable({
      startY: 50,
      head: [['Producto', 'Cantidad Vendida', 'Total Ventas']],
      body: productsReport.masVendidos.map(p => [
        p.nombre,
        p.cantidad_vendida,
        `$${Number(p.total_ventas).toLocaleString('es-CO')}`
      ]),
    });
    
    // Productos menos vendidos
    if (productsReport.menosVendidos.length > 0) {
      doc.addPage();
      doc.text('Productos Menos Vendidos', 14, 22);
      
      doc.autoTable({
        startY: 30,
        head: [['Producto', 'Cantidad Vendida', 'Total Ventas']],
        body: productsReport.menosVendidos.map(p => [
          p.nombre,
          p.cantidad_vendida,
          `$${Number(p.total_ventas).toLocaleString('es-CO')}`
        ]),
      });
    }
    
    doc.save(`reporte-productos-${new Date().getTime()}.pdf`);
    toast.success('Reporte de productos exportado correctamente');
  };

  // ========================================
  // EXPORTAR A PDF - CLIENTES FRECUENTES
  // ========================================
  const exportFrequentClientsToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Reporte de Clientes Frecuentes', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 30);
    doc.text('Criterio: Clientes con 5 o más compras en un mes', 14, 36);
    
    doc.setFontSize(14);
    doc.text('Top Clientes Frecuentes', 14, 50);
    
    doc.autoTable({
      startY: 55,
      head: [['Cliente', 'Correo', 'Total Pedidos', 'Total Gastado', 'Meses Frecuente']],
      body: frequentClientsReport.map(c => [
        c.nombre,
        c.correo,
        c.total_pedidos,
        `$${Number(c.total_gastado).toLocaleString('es-CO')}`,
        c.meses_frecuente_count || 'N/A'
      ]),
    });
    
    doc.save(`reporte-clientes-frecuentes-${new Date().getTime()}.pdf`);
    toast.success('Reporte de clientes frecuentes exportado correctamente');
  };

  return (
    <div className="reports-page">
      <HeaderDashboard title="Reportes" />
      
      <main className="reports-content">
        <div className="reports-header">
          <div>
            <h1>📊 Reportes y Análisis</h1>
            <p>Visualiza estadísticas y métricas importantes del negocio</p>
          </div>
          <button
            className="btn-refresh"
            onClick={loadAllReports}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* ========================================
            REPORTE DE VENTAS
            ======================================== */}
        <div className="report-section">
          <div className="report-section-header">
            <div className="report-section-title">
              <TrendingUp size={24} />
              <h2>Reporte de Ventas</h2>
            </div>
            <button
              className="btn-export"
              onClick={exportSalesReportToPDF}
              disabled={loading}
            >
              <Download size={18} />
              Exportar PDF
            </button>
          </div>

          <div className="report-cards-grid">
            <div className="report-metric-card">
              <div className="metric-icon sales">
                <DollarSign size={28} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Ventas</span>
                <span className="metric-value">
                  ${salesReport.totalVentas.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="report-metric-card">
              <div className="metric-icon today">
                <Calendar size={28} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Ventas Hoy</span>
                <span className="metric-value">
                  ${salesReport.ventasHoy.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="report-metric-card">
              <div className="metric-icon week">
                <TrendingUp size={28} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Esta Semana</span>
                <span className="metric-value">
                  ${salesReport.ventasSemana.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="report-metric-card">
              <div className="metric-icon month">
                <ShoppingCart size={28} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Este Mes</span>
                <span className="metric-value">
                  ${salesReport.ventasMes.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>

          <div className="report-details-table">
            <h3>Pedidos por Estado</h3>
            <table>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pendiente</td>
                  <td>{salesReport.pedidosPorEstado.pendiente}</td>
                </tr>
                <tr>
                  <td>En Preparación</td>
                  <td>{salesReport.pedidosPorEstado.en_preparacion}</td>
                </tr>
                <tr>
                  <td>Entregado</td>
                  <td>{salesReport.pedidosPorEstado.entregado}</td>
                </tr>
                <tr>
                  <td>Pagado</td>
                  <td>{salesReport.pedidosPorEstado.pagado}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================
            REPORTE DE PRODUCTOS
            ======================================== */}
        <div className="report-section">
          <div className="report-section-header">
            <div className="report-section-title">
              <Package size={24} />
              <h2>Reporte de Productos</h2>
            </div>
            <button
              className="btn-export"
              onClick={exportProductsReportToPDF}
              disabled={loading}
            >
              <Download size={18} />
              Exportar PDF
            </button>
          </div>

          <div className="report-details-table">
            <h3>Productos Más Vendidos</h3>
            {productsReport.masVendidos.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Posición</th>
                    <th>Producto</th>
                    <th>Cantidad Vendida</th>
                    <th>Total Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {productsReport.masVendidos.map((producto, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{producto.nombre}</td>
                      <td>{producto.cantidad_vendida}</td>
                      <td>${Number(producto.total_ventas).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No hay datos de productos vendidos</p>
            )}
          </div>

          <div className="report-details-table">
            <h3>Productos Menos Vendidos</h3>
            {productsReport.menosVendidos.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad Vendida</th>
                    <th>Total Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {productsReport.menosVendidos.map((producto, index) => (
                    <tr key={index}>
                      <td>{producto.nombre}</td>
                      <td>{producto.cantidad_vendida}</td>
                      <td>${Number(producto.total_ventas).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No hay datos de productos menos vendidos</p>
            )}
          </div>
        </div>

        {/* ========================================
            REPORTE DE CLIENTES FRECUENTES
            ======================================== */}
        <div className="report-section">
          <div className="report-section-header">
            <div className="report-section-title">
              <Users size={24} />
              <h2>Clientes Frecuentes</h2>
            </div>
            <button
              className="btn-export"
              onClick={exportFrequentClientsToPDF}
              disabled={loading}
            >
              <Download size={18} />
              Exportar PDF
            </button>
          </div>

          <div className="report-details-table">
            <h3>
              <Award size={20} style={{display: 'inline', marginRight: '8px'}} />
              Top Clientes Frecuentes (8+ compras/mes)
            </h3>
            {frequentClientsReport.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Posición</th>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Total Pedidos</th>
                    <th>Total Gastado</th>
                    <th>Meses Frecuente</th>
                  </tr>
                </thead>
                <tbody>
                  {frequentClientsReport.map((client, index) => (
                    <tr key={index}>
                      <td>
                        {index < 3 ? (
                          <span style={{fontSize: '1.2em'}}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          index + 1
                        )}
                      </td>
                      <td>{client.nombre}</td>
                      <td>{client.correo}</td>
                      <td>{client.total_pedidos}</td>
                      <td>${Number(client.total_gastado).toLocaleString('es-CO')}</td>
                      <td>
                        <span style={{
                          background: '#4ECDC4',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          {client.meses_frecuente_count || 0} mes{client.meses_frecuente_count !== 1 ? 'es' : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">
                No hay clientes frecuentes en este momento.<br/>
                <small style={{color: '#718096', fontSize: '0.9em'}}>
                  Un cliente se considera frecuente cuando realiza 8 o más compras en un mes.
                </small>
              </p>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReportsPage;