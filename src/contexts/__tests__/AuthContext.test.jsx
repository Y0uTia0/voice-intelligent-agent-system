import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../AuthContext';

// 移除不必要的mock，使用jest.setup.js中的模拟
jest.mock('../../../package.json', () => ({
  name: 'frontend'
}), { virtual: true });

describe('AuthContext', () => {
  // 保存原始的localStorage和console
  let originalLocalStorage;
  let originalConsoleLog;
  let originalConsoleError;
  let mockLocalStorage;
  let originalIsDevValue;
  
  beforeEach(() => {
    // 保存原始环境变量
    originalIsDevValue = process.env.IS_DEV;
    process.env.IS_DEV = 'false';
    
    // 保存原始console方法
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();
    
    // 保存原始localStorage
    originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');
    
    // 创建localStorage的mock实现
    mockLocalStorage = {
      store: {},
      getItem: jest.fn(key => mockLocalStorage.store[key] || null),
      setItem: jest.fn((key, value) => {
        mockLocalStorage.store[key] = value?.toString() || '';
      }),
      removeItem: jest.fn(key => {
        delete mockLocalStorage.store[key];
      }),
      clear: jest.fn(() => {
        mockLocalStorage.store = {};
      })
    };
    
    // 替换全局localStorage
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });
  
  afterEach(() => {
    // 恢复原始环境变量
    process.env.IS_DEV = originalIsDevValue;
    
    // 恢复原始localStorage
    if (originalLocalStorage) {
      Object.defineProperty(global, 'localStorage', originalLocalStorage);
    } else {
      delete global.localStorage;
    }
    
    // 恢复原始console方法
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    jest.clearAllMocks();
  });
  
  const renderAuthContext = () => {
    const TestComponent = () => {
      const auth = useAuth();
      return (
        <div>
          <div data-testid="auth-status">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
          <div data-testid="user-id">{auth.userId || 'no-user'}</div>
          <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
          <div data-testid="error">{auth.error || 'no-error'}</div>
          <button data-testid="login-btn" onClick={() => auth.login({ access_token: 'test-token', user_id: '123', username: 'test', role: 'user' })}>Login</button>
          <button data-testid="logout-btn" onClick={() => auth.logout()}>Logout</button>
          <button data-testid="mock-btn" onClick={() => auth.setupMockAuth()}>Setup Mock</button>
        </div>
      );
    };
    
    return render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  };
  
  describe('初始化', () => {
    it('初始状态应完成加载', async () => {
      // 注意：由于异步初始化可能已经完成，所以直接检查最终状态
      renderAuthContext();
      
      // 等待加载完成
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('not-loading');
      });
      
      // 应为未认证状态
      expect(screen.getByTestId('auth-status').textContent).toBe('not-authenticated');
      expect(screen.getByTestId('user-id').textContent).toBe('no-user');
    });
    
    it('如果localStorage中有token应自动认证', async () => {
      // 预设localStorage中的认证信息
      mockLocalStorage.store = {
        'auth_token': 'saved-token',
        'user_id': '999'
      };
      
      renderAuthContext();
      
      // 等待加载完成
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('not-loading');
      });
      
      // 应为已认证状态
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-id').textContent).toBe('999');
    });
    
    it('开发环境下无token时应设置模拟认证', async () => {
      // 设置为开发环境
      process.env.IS_DEV = 'true';
      
      // 确保localStorage中没有认证信息
      mockLocalStorage.store = {};
      
      renderAuthContext();
      
      // 等待加载完成
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('not-loading');
      });
      
      // 应为已认证状态
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-id').textContent).toBe('1'); // 模拟用户ID
      
      // 验证localStorage设置
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token');
    });
  });
  
  describe('login方法', () => {
    it('登录成功应更新认证状态和localStorage', async () => {
      const { getByTestId } = renderAuthContext();
      
      // 等待加载完成
      await waitFor(() => {
        expect(getByTestId('loading').textContent).toBe('not-loading');
      });
      
      // 点击登录按钮
      act(() => {
        getByTestId('login-btn').click();
      });
      
      // 验证认证状态
      expect(getByTestId('auth-status').textContent).toBe('authenticated');
      expect(getByTestId('user-id').textContent).toBe('123');
      
      // 验证localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_id', '123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('username', 'test');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_role', 'user');
    });
  });
  
  describe('logout方法', () => {
    it('注销应清除认证状态和localStorage', async () => {
      // 预设已认证状态
      mockLocalStorage.store = {
        'auth_token': 'existing-token',
        'user_id': '123',
        'username': 'testuser',
        'user_role': 'user'
      };
      
      const { getByTestId } = renderAuthContext();
      
      // 等待加载完成并确认已认证
      await waitFor(() => {
        expect(getByTestId('loading').textContent).toBe('not-loading');
        expect(getByTestId('auth-status').textContent).toBe('authenticated');
      });
      
      // 点击注销按钮
      act(() => {
        getByTestId('logout-btn').click();
      });
      
      // 验证已注销
      expect(getByTestId('auth-status').textContent).toBe('not-authenticated');
      expect(getByTestId('user-id').textContent).toBe('no-user');
      
      // 验证localStorage项已被移除
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_id');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('username');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_role');
    });
  });
  
  describe('setupMockAuth方法', () => {
    it('应设置模拟认证信息', async () => {
      const { getByTestId } = renderAuthContext();
      
      // 等待加载完成
      await waitFor(() => {
        expect(getByTestId('loading').textContent).toBe('not-loading');
      });
      
      // 点击设置模拟认证按钮
      act(() => {
        getByTestId('mock-btn').click();
      });
      
      // 验证认证状态
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
      expect(screen.getByTestId('user-id').textContent).toBe('1');
      
      // 验证localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_id', '1');
    });
  });
  
  describe('useAuth Hook', () => {
    it('通过组件测试hook功能', () => {
      // 通过渲染使用了hook的组件来间接测试hook
      const { container } = renderAuthContext();
      
      // 验证组件已渲染，说明hook工作正常
      expect(container).toBeDefined();
      expect(screen.getByTestId('auth-status')).toBeInTheDocument();
    });
    
    it('应提供所有必要的认证方法和状态', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // 验证提供的值
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('userId');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.setupMockAuth).toBe('function');
    });
  });
}); 