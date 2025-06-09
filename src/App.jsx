import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import MainPage from './pages/MainPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/App.css';

// 调试工具栏组件
const DebugToolbar = () => {
  const [isMswActive, setIsMswActive] = useState(false);
  const { isAuthenticated, logout, setupMockAuth } = useAuth();
  
  // 检查MSW状态
  useEffect(() => {
    const checkMsw = () => {
      const mswStatus = window.msw?.active;
      console.log('App: MSW状态检查:', mswStatus);
      setIsMswActive(!!mswStatus);
      
      if (window._checkMswStatus && typeof window._checkMswStatus === 'function') {
        const detailedStatus = window._checkMswStatus();
        console.log('App: MSW详细状态:', detailedStatus);
      }
    };
    
    // 初始检查
    checkMsw();
    
    // 5秒后再检查一次（等待可能的延迟初始化）
    const timer = setTimeout(checkMsw, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // 切换登录状态
  const toggleAuth = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setupMockAuth();
    }
  };

  return (
    <div className="debug-toolbar">
      <div className="debug-item">
        MSW状态: <span className={isMswActive ? 'status-active' : 'status-inactive'}>
          {isMswActive ? '✅ 活跃' : '❌ 未启动'}
        </span>
      </div>
      <div className="debug-item">
        认证状态: <span className={isAuthenticated ? 'status-active' : 'status-inactive'}>
          {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}
        </span>
        <button className="debug-btn" onClick={toggleAuth}>
          {isAuthenticated ? '注销' : '模拟登录'}
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app">
          <DebugToolbar />
          
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 