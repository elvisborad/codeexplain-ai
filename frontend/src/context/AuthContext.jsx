import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await apiFetch('/auth/me');
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token. Logging out...');
          logoutUser();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const registerUser = async (username, email, password) => {
    setError(null);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginUser = async (email, password) => {
    setError(null);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (email, username, googleId) => {
    setError(null);
    try {
      const data = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ email, username, googleId })
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        registerUser,
        loginUser,
        loginWithGoogle,
        logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
