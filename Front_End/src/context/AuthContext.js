// src/context/AuthContext.jsx - VERSIÓN CORREGIDA
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        // Decodificar el token para verificar expiración
        const decoded = jwtDecode(token);
        
        // Verificar si el token no ha expirado
        if (decoded.exp * 1000 > Date.now()) {
          // Usar los datos guardados en localStorage
          const parsedUser = JSON.parse(userData);
          setUser({
            id: parsedUser.id,
            nombre: parsedUser.nombre,
            correo: parsedUser.correo,
            rol: parsedUser.rol
          });
          setIsAuthenticated(true);
        } else {
          // Token expirado, limpiar
          logout();
        }
      } else {
        // No hay token o userData
        logout();
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    try {
      // Guardar token y datos del usuario
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Establecer usuario en el estado
      setUser({
        id: userData.id,
        nombre: userData.nombre,
        correo: userData.correo,
        rol: userData.rol
      });
      setIsAuthenticated(true);
      
      console.log('✅ Login exitoso:', userData);
      return true;
    } catch (error) {
      console.error('❌ Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};