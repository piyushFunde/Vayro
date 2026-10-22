import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, driverApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vayro_token'));
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('ROLE_RIDER');
  const [authError, setAuthError] = useState(null);

  // Initialize session ONLY if user previously logged in with a real JWT token
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem('vayro_token');
      if (storedToken) {
        try {
          const data = await authApi.getCurrentUser();
          setUser(data.user);
          setDriver(data.driver);
          setActiveRole(data.user.role);
        } catch (err) {
          // Token is invalid or expired, clear it
          localStorage.removeItem('vayro_token');
          setToken(null);
          setUser(null);
          setDriver(null);
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('vayro_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setDriver(data.driver);
    setActiveRole(data.user.role);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    localStorage.setItem('vayro_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setDriver(data.driver);
    setActiveRole(data.user.role);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('vayro_token');
    setToken(null);
    setUser(null);
    setDriver(null);
    setActiveRole('ROLE_RIDER');
  };

  const switchRole = (targetRole) => {
    setActiveRole(targetRole);
  };

  const toggleDriverStatus = async () => {
    const nextStatus = (!driver || driver.status === 'AVAILABLE') ? 'OFFLINE' : 'AVAILABLE';
    try {
      await driverApi.updateStatus(nextStatus);
      setDriver((prev) => (prev ? { ...prev, status: nextStatus } : { status: nextStatus }));
    } catch (err) {
      // Fallback local toggle if offline or demo
      setDriver((prev) => (prev ? { ...prev, status: nextStatus } : { status: nextStatus }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        driver,
        token,
        loading,
        activeRole,
        authError,
        login,
        register,
        logout,
        switchRole,
        toggleDriverStatus,
        setDriver,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
