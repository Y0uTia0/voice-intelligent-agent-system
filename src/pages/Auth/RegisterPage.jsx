import React, { useState } from 'react';
import { Form, Input, Button, Toast } from 'antd-mobile';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      Toast.show({
        content: '两次输入的密码不一致',
        position: 'bottom'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/v1/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '注册失败');
      }
      
      // 注册成功
      Toast.show({
        content: '注册成功，请登录',
        position: 'bottom',
        afterClose: () => {
          navigate('/auth/login');
        }
      });
    } catch (error) {
      Toast.show({
        content: `注册失败: ${error.message}`,
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 max-w-md mx-auto mt-10">
      <h2 className="text-xl mb-6 text-center">用户注册</h2>
      
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
            注册
          </Button>
        }
      >
        <Form.Item 
          name="username" 
          label="用户名" 
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少3个字符' }
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        
        <Form.Item 
          name="email" 
          label="邮箱" 
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        
        <Form.Item 
          name="password" 
          label="密码" 
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' }
          ]}
        >
          <Input type="password" placeholder="请输入密码" />
        </Form.Item>
        
        <Form.Item 
          name="confirmPassword" 
          label="确认密码" 
          rules={[
            { required: true, message: '请确认密码' },
            { min: 6, message: '密码至少6个字符' }
          ]}
        >
          <Input type="password" placeholder="请再次输入密码" />
        </Form.Item>
      </Form>
      
      <div className="mt-4 text-center">
        <span className="text-gray-500">已有账号？</span>
        <Link to="/auth/login" className="text-primary ml-1">
          立即登录
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage; 