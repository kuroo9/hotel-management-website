import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intercept 401 Unauthorized responses to handle DB resets and expired tokens globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setUser(null);
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        setUser(userData); // Restore user immediately from localStorage
        
        // Verify in background without blocking UI
        try {
          await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, { timeout: 5000 });
        } catch (error) {
          // Global interceptor will handle 401s and redirect to login automatically.
          console.warn('Session verification handled by interceptor or network failed');
        }
      }
      setLoading(false);
    };
    
    initializeAuth();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      toast.success('Login Successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login Failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged Out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
