import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/apiClient';

const initialAuthState = {
  isAuthenticated: false,
  user: null,
  loading: true
};

const AuthContext = createContext(initialAuthState);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialAuthState);

  // 从本地存储加载认证状态
  useEffect(() => {
    console.log('AuthProvider: 从localStorage加载认证状态');
    try {
      const token = localStorage.getItem('auth_token');
      const userId = localStorage.getItem('user_id');
      const username = localStorage.getItem('username');
      const userRole = localStorage.getItem('user_role');

      console.log('AuthProvider: 找到token?', !!token);
      
      if (token) {
        setAuthState({
          isAuthenticated: true,
          user: {
            id: userId,
            username: username || 'testuser',
            role: userRole || 'user'
          },
          loading: false
        });
        console.log('AuthProvider: 设置认证状态为已登录');
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
        console.log('AuthProvider: 设置认证状态为未登录');
      }
    } catch (error) {
      console.error('AuthProvider: 加载认证状态出错', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  }, []);

  // 登录
  const login = async (userData) => {
    console.log('AuthProvider: 登录', userData);
    // 保存数据到本地存储
    localStorage.setItem('auth_token', userData.access_token);
    localStorage.setItem('user_id', userData.user_id);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('user_role', userData.role);

    setAuthState({
      isAuthenticated: true,
      user: {
        id: userData.user_id,
        username: userData.username,
        role: userData.role
      },
      loading: false
    });
    return true;
  };

  // 登出
  const logout = () => {
    console.log('AuthProvider: 登出');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  const authContextValue = {
    ...authState,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
} 