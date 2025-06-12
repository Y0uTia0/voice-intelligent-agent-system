import React, { useState } from 'react';
import { Form, Input, Button, Toast } from 'antd-mobile';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// 调试信息组件
const DebugInfo = ({ className }) => (
  <div className={`text-xs bg-gray-100 p-2 rounded-md text-gray-700 ${className}`}>
    <h4 className="font-bold">调试信息</h4>
    <p>- 测试账号: user/developer/admin</p>
    <p>- 密码: password</p>
    <p>- MSW状态: {window.msw?.active ? '✅ 活跃' : '❌ 未启动'}</p>
  </div>
);

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(null);
  
  // 获取重定向来源
  const from = location.state?.from?.pathname || '/';
  
  const onFinish = async (values) => {
    setLoading(true);
    setLoginAttempt({
      status: 'pending',
      username: values.username,
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log('LoginPage: 开始登录尝试', values.username);
      const result = await login(values.username, values.password);
      console.log('LoginPage: 登录成功，结果:', result);
      
      setLoginAttempt({
        status: 'success',
        username: values.username,
        timestamp: new Date().toISOString(),
        data: result
      });
      
      // 登录成功后显示提示
      Toast.show({
        content: '登录成功',
        position: 'bottom',
        afterClose: () => {
          // 登录成功后跳转到之前的页面或首页
          navigate(from, { replace: true });
        }
      });
    } catch (error) {
      console.error('LoginPage: 登录失败', error);
      setLoginAttempt({
        status: 'error',
        username: values.username,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      
      Toast.show({
        content: `登录失败: ${error.message}`,
        position: 'bottom'
      });
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-10">
      <h2 className="text-xl mb-6 text-center">用户登录</h2>
      <Form
        layout="vertical"
        onFinish={onFinish}
        footer={
          <Button 
            block 
            color="primary" 
            loading={loading}
            type="submit"
            size="large"
          >
            登录
          </Button>
        }
      >
        <Form.Item 
          name="username" 
          label="用户名" 
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        
        <Form.Item 
          name="password" 
          label="密码" 
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input type="password" placeholder="请输入密码" />
        </Form.Item>
      </Form>
      
      {/* 测试账号信息 */}
      <div className="mt-4 mb-4 p-2 border border-blue-300 rounded bg-blue-50 text-blue-800">
        <p className="text-sm font-bold">测试账号:</p>
        <p className="text-xs">用户名: user / developer / admin</p>
        <p className="text-xs">密码: password</p>
      </div>
      
      {/* 登录调试信息 */}
      {loginAttempt && (
        <div className={`mt-4 p-2 rounded border ${
          loginAttempt.status === 'success' ? 'border-green-300 bg-green-50 text-green-800' : 
          loginAttempt.status === 'error' ? 'border-red-300 bg-red-50 text-red-800' : 
          'border-yellow-300 bg-yellow-50 text-yellow-800'
        }`}>
          <p>状态: {loginAttempt.status}</p>
          <p>用户: {loginAttempt.username}</p>
          <p>时间: {loginAttempt.timestamp}</p>
          {loginAttempt.error && <p>错误: {loginAttempt.error}</p>}
          {loginAttempt.data && <p>登录成功!</p>}
        </div>
      )}
      
      <DebugInfo className="mt-4" />
      
      <div className="mt-4 text-center">
        <span className="text-gray-500">还没有账号？</span>
        <Link to="/auth/register" className="text-primary ml-1">
          立即注册
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;