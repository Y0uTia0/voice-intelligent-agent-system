import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/apiClient';
import { isDev } from '../utils/env';

// 创建认证上下文
const AuthContext = createContext({
  isAuthenticated: false,
  userId: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  setupMockAuth: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从本地存储加载认证状态
  useEffect(() => {
    const initializeAuth = () => {
      try {
    console.log('AuthProvider: 从localStorage加载认证状态');
      const token = localStorage.getItem('auth_token');
        const storedUserId = localStorage.getItem('user_id');

      console.log('AuthProvider: 找到token?', !!token);
      
      if (token) {
          setIsAuthenticated(true);
          setUserId(storedUserId);
        } else {
          // 开发环境下自动使用模拟认证
          if (isDev()) {
            console.log('AuthProvider: 开发环境，设置模拟认证');
            setupMockAuth();
      } else {
            setIsAuthenticated(false);
            setUserId(null);
          }
      }
    } catch (error) {
      console.error('AuthProvider: 加载认证状态出错', error);
        setError('加载认证状态出错');
      } finally {
        setLoading(false);
    }
    };
    
    initializeAuth();
  }, []);

  // 模拟认证（开发环境使用）
  const setupMockAuth = () => {
    console.log('AuthProvider: 设置模拟认证');
    
    const mockToken = 'mock-jwt-token';
    const mockUserId = '1';
    
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user_id', mockUserId);
    localStorage.setItem('username', 'testuser');
    localStorage.setItem('user_role', 'user');
    
    setIsAuthenticated(true);
    setUserId(mockUserId);
    
    console.log('AuthProvider: 模拟认证成功设置');
  };

  // 登录
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
    console.log('AuthProvider: 登录', userData);
    // 保存数据到本地存储
    localStorage.setItem('auth_token', userData.access_token);
    localStorage.setItem('user_id', userData.user_id);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('user_role', userData.role);

      setIsAuthenticated(true);
      setUserId(userData.user_id);
      
    return true;
    } catch (err) {
      console.error('AuthProvider: 登录失败:', err);
      setError('登录失败: ' + (err.message || '未知错误'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = () => {
    console.log('AuthProvider: 登出');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');

    setIsAuthenticated(false);
    setUserId(null);
  };

  const contextValue = {
    isAuthenticated,
    userId,
    loading,
    error,
    login,
    logout,
    setupMockAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
} 