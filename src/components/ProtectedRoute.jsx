import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 受保护的路由组件，用于拦截未登录用户
 * @param {Object} props
 * @param {JSX.Element} props.children 子组件
 * @param {Array} [props.allowedRoles] 允许访问的角色列表
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, role, loading } = useAuth();
  const location = useLocation();

  // 如果认证状态正在加载，显示加载中
  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  // 如果用户未登录，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 如果指定了允许的角色，但用户角色不在其中，显示无权限
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-xl text-error mb-4">无访问权限</h2>
        <p>您没有权限访问此页面</p>
      </div>
    );
  }

  // 通过所有检查，渲染子组件
  return children;
}

export default ProtectedRoute; 