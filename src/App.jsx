import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainPage from './pages/MainPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DeveloperConsolePage from './pages/DeveloperConsolePage/DeveloperConsolePage';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

// 新版调试工具栏组件，与新的AuthContext兼容
const DebugToolbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMswActive, setIsMswActive] = React.useState(false);
  
  // 检查MSW状态
  React.useEffect(() => {
    const checkMsw = () => {
      const mswStatus = window.msw?.active;
      console.log('App: MSW状态检查:', mswStatus);
      setIsMswActive(!!mswStatus);
    };
    
    // 初始检查
    checkMsw();
    
    // 5秒后再检查一次（等待可能的延迟初始化）
    const timer = setTimeout(checkMsw, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="debug-toolbar">
      <div className="debug-item">
        MSW状态: <span className={isMswActive ? 'status-active' : 'status-inactive'}>
          {isMswActive ? '✅ 活跃' : '❌ 未启动'}
        </span>
      </div>
      <div className="debug-item">
        认证状态: <span className={isAuthenticated ? 'status-active' : 'status-inactive'}>
          {isAuthenticated ? `✅ 已登录 (${user?.username || '用户'})` : '❌ 未登录'}
        </span>
        {isAuthenticated && (
          <button className="debug-btn" onClick={logout}>
            注销
          </button>
        )}
      </div>
    </div>
  );
};

// 判断是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app">
          {/* 仅在开发环境显示调试工具栏 */}
          {isDevelopment && <DebugToolbar />}
          
          <Routes>
            {/* 公开路由 */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            
            {/* 受保护的路由 */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } />
            
            {/* 开发者路由 - 只允许developer或admin角色访问 */}
            <Route path="/developer" element={
              <ProtectedRoute allowedRoles={['developer', 'admin']}>
                <DeveloperConsolePage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 