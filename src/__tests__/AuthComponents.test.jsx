import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

// 模拟fetch请求
global.fetch = jest.fn();

// 模拟AuthContext内部的函数
jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: () => ({
    login: jest.fn().mockResolvedValue({ user_id: 1, username: 'testuser', role: 'user' }),
    isAuthenticated: false,
    loading: false
  })
}));

// 模拟Toast组件
jest.mock('antd-mobile', () => ({
  ...jest.requireActual('antd-mobile'),
  Toast: {
    show: jest.fn()
  }
}));

describe('认证组件测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoginPage', () => {
    test('登录页面渲染正确', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      expect(screen.getByText('用户登录')).toBeInTheDocument();
      expect(screen.getByText('立即注册')).toBeInTheDocument();
      expect(screen.getByLabelText('用户名')).toBeInTheDocument();
      expect(screen.getByLabelText('密码')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    });

    test('输入验证正常工作', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: '登录' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('请输入用户名')).toBeInTheDocument();
        expect(screen.getByText('请输入密码')).toBeInTheDocument();
      });
    });
  });

  describe('RegisterPage', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1, username: 'newuser', email: 'user@example.com' })
      });
    });

    test('注册页面渲染正确', () => {
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      );

      expect(screen.getByText('用户注册')).toBeInTheDocument();
      expect(screen.getByText('立即登录')).toBeInTheDocument();
      expect(screen.getByLabelText('用户名')).toBeInTheDocument();
      expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
      expect(screen.getByLabelText('密码')).toBeInTheDocument();
      expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
    });

    test('验证密码匹配', async () => {
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      );

      // 填写表单
      fireEvent.change(screen.getByLabelText('用户名'), { 
        target: { value: 'testuser' } 
      });
      fireEvent.change(screen.getByLabelText('邮箱'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('密码'), { 
        target: { value: 'password123' } 
      });
      fireEvent.change(screen.getByLabelText('确认密码'), { 
        target: { value: 'password456' } 
      });

      const submitButton = screen.getByRole('button', { name: '注册' });
      fireEvent.click(submitButton);

      expect(require('antd-mobile').Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '两次输入的密码不一致'
        })
      );
    });
  });
}); 