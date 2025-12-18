// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #8B0000',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(user?.rol);
    
    if (!hasPermission) {
      return (
        <div className="access-denied-container" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{ color: '#8B0000', fontSize: '3rem', marginBottom: '1rem' }}>
            🚫 Acceso Denegado
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            No tienes permisos para acceder a esta página.
          </p>
          <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
            Tu rol actual: <strong>{user?.rol}</strong>
            <br />
            Roles requeridos: <strong>{allowedRoles.join(', ')}</strong>
          </p>
          <button 
            onClick={() => window.history.back()}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#8B0000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Volver
          </button>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;