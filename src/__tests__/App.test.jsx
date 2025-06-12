import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// 模拟依赖组件
jest.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    isAuthenticated: true,
    logout: jest.fn(),
    setupMockAuth: jest.fn(),
  }),
}));

jest.mock('../pages/MainPage', () => {
  return function MockedMainPage() {
    return <div data-testid="main-page">主页内容</div>;
  };
});

describe('App组件', () => {
  // 模拟window.msw对象
  beforeEach(() => {
    window.msw = {
      active: true
    };
    
    // 模拟window._checkMswStatus函数
    window._checkMswStatus = jest.fn().mockReturnValue({
      active: true,
      handlers: ['handler1', 'handler2']
    });
  });

  afterEach(() => {
    delete window.msw;
    delete window._checkMswStatus;
  });

  test('应该正确渲染App组件', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 验证关键组件是否被渲染
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('main-page')).toBeInTheDocument();
  });

  test('应该渲染DebugToolbar组件', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // DebugToolbar应该显示MSW状态
    expect(screen.getByText(/MSW状态/)).toBeInTheDocument();
    expect(screen.getByText(/✅ 活跃/)).toBeInTheDocument();
    
    // DebugToolbar应该显示认证状态
    expect(screen.getByText(/认证状态/)).toBeInTheDocument();
    expect(screen.getByText(/✅ 已登录/)).toBeInTheDocument();
  });

  test('当MSW未激活时应显示正确状态', () => {
    // 模拟MSW未激活
    window.msw = {
      active: false
    };
    
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 应该显示MSW未启动
    expect(screen.getByText(/❌ 未启动/)).toBeInTheDocument();
  });
}); 