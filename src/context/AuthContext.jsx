import React, { createContext, useState, useContext, useEffect } from 'react';

// 创建认证上下文
export const AuthContext = createContext({
  isAuthenticated: false,
  userId: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  setupMockAuth: () => {}
});

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化状态 - 从localStorage恢复会话
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('AuthContext: 初始化认证状态');
        const token = localStorage.getItem('auth_token');
        const storedUserId = localStorage.getItem('user_id');
        
        console.log('AuthContext: 本地存储token状态:', !!token);
        console.log('AuthContext: 本地存储userId:', storedUserId);
        
        if (token) {
          setIsAuthenticated(true);
          setUserId(storedUserId);
        } else {
          // 开发环境下自动使用模拟认证
          if (import.meta.env.DEV) {
            console.log('AuthContext: 开发环境，设置模拟认证');
            setupMockAuth();
          }
        }
      } catch (err) {
        console.error('AuthContext: 初始化认证时出错:', err);
        setError('初始化认证时出错');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // 模拟认证（开发环境使用）
  const setupMockAuth = () => {
    console.log('AuthContext: 设置模拟认证');
    
    const mockToken = 'mock-jwt-token';
    const mockUserId = '1';
    
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user_id', mockUserId);
    localStorage.setItem('username', 'testuser');
    localStorage.setItem('user_role', 'user');
    
    setIsAuthenticated(true);
    setUserId(mockUserId);
    
    console.log('AuthContext: 模拟认证成功设置');
  };

  // 登录
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      localStorage.setItem('auth_token', userData.access_token);
      localStorage.setItem('user_id', userData.user_id);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('user_role', userData.role);
      
      setIsAuthenticated(true);
      setUserId(userData.user_id);
      
      return true;
    } catch (err) {
      console.error('AuthContext: 登录失败:', err);
      setError('登录失败: ' + (err.message || '未知错误'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 注销
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    
    setIsAuthenticated(false);
    setUserId(null);
    
    console.log('AuthContext: 已注销');
  };

  // 提供的上下文值
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

// 便捷的Hook，用于获取认证上下文
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider; 