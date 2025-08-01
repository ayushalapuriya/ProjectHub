import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};



const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getMe();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data,
              token
            }
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({
            type: 'AUTH_FAIL',
            payload: 'Session expired'
          });
        }
      } else {
        dispatch({
          type: 'AUTH_FAIL',
          payload: null
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login(email, password);

      // Store token
      const token = response.token || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      // Get user data
      const userData = response.data || response;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: userData,
          token: token
        }
      });

      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      
      localStorage.setItem('token', response.data.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data,
          token: response.data.token
        }
      });
      
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
