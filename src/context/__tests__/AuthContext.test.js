import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, AuthContext } from '../AuthContext';

// 创建一个测试组件，用于访问useAuth
const TestComponent = ({ testHandler }) => {
  const auth = useAuth();
  
  React.useEffect(() => {
    if (testHandler) {
      testHandler(auth);
    }
  }, [auth, testHandler]);
  
  return (
    <div>
      <div data-testid="auth-status">{auth.isAuthenticated ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="user-id">{auth.userId || 'no-user'}</div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
      <button data-testid="login-btn" onClick={() => auth.login({
        access_token: 'test-token',
        user_id: 'test-user',
        username: 'testuser',
        role: 'user'
      })}>Login</button>
      <button data-testid="logout-btn" onClick={auth.logout}>Logout</button>
      <button data-testid="mock-auth-btn" onClick={auth.setupMockAuth}>Setup Mock Auth</button>
    </div>
  );
};

// 手动模拟initializeAuth函数中的import.meta.env逻辑
// 在AuthContext.jsx中它检查import.meta.env.DEV来决定是否自动设置mockAuth
const mockInitializeAuth = (devMode = false) => {
  // 保存原始环境
  const originalImport = global.import;
  
  // 设置mock环境
  global.import = {
    meta: {
      env: {
        DEV: devMode
      }
    }
  };
  
  return () => {
    global.import = originalImport;
  };
};

describe('AuthContext', () => {
  // 每次测试前重置localStorage mock
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');
    
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('初始化时应该检查localStorage中的token', () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'auth_token') return 'stored-token';
      if (key === 'user_id') return 'stored-user';
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    expect(localStorage.getItem).toHaveBeenCalledWith('user_id');
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-in');
    expect(screen.getByTestId('user-id').textContent).toBe('stored-user');
  });
  
  test('如果localStorage没有token但是在开发环境，应该自动设置模拟认证', () => {
    // 设置为开发环境
    const cleanup = mockInitializeAuth(true);
    
    localStorage.getItem.mockImplementation(() => null);
    
    // 手动模拟setupMockAuth
    jest.spyOn(AuthContext.Provider, 'value', 'get').mockImplementation(() => ({
      isAuthenticated: true,
      userId: '1',
      setupMockAuth: jest.fn(),
      logout: jest.fn()
    }));
    
    // 我们直接测试AuthContext的初始化逻辑而不是通过render
    const authContext = new AuthContext.Provider({ value: {} });
    
    // 验证setupMockAuth被调用
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('user_id', '1');
    
    // 清理
    cleanup();
  });
  
  test('如果localStorage没有token且不在开发环境，初始状态为未登录', () => {
    // 设置非开发环境
    const cleanup = mockInitializeAuth(false);
    
    localStorage.getItem.mockImplementation(() => null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 在非开发环境中不应自动设置mockAuth
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-out');
    expect(screen.getByTestId('user-id').textContent).toBe('no-user');
    
    // 清理
    cleanup();
  });
  
  test('登录成功应该设置认证状态和用户ID', async () => {
    const cleanup = mockInitializeAuth(false);
    localStorage.getItem.mockImplementation(() => null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 执行登录操作
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });
    
    // 验证状态变更和localStorage调用
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-in');
    expect(screen.getByTestId('user-id').textContent).toBe('test-user');
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('user_id', 'test-user');
    expect(localStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
    expect(localStorage.setItem).toHaveBeenCalledWith('user_role', 'user');
    
    cleanup();
  });
  
  test('注销应该清除认证状态和localStorage', async () => {
    // 模拟已登录状态
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'auth_token') return 'test-token';
      if (key === 'user_id') return 'test-user';
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 确保初始状态为已登录
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-in');
    
    // 执行注销操作
    await act(async () => {
      fireEvent.click(screen.getByTestId('logout-btn'));
    });
    
    // 验证状态变更和localStorage调用
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-out');
    expect(screen.getByTestId('user-id').textContent).toBe('no-user');
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user_id');
    expect(localStorage.removeItem).toHaveBeenCalledWith('username');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user_role');
  });
  
  test('setupMockAuth应该设置模拟认证状态', async () => {
    const cleanup = mockInitializeAuth(false);
    localStorage.getItem.mockImplementation(() => null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 确保初始状态为未登录
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-out');
    
    // 设置模拟认证
    await act(async () => {
      fireEvent.click(screen.getByTestId('mock-auth-btn'));
    });
    
    // 验证状态变更和localStorage调用
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-in');
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('user_id', '1');
    expect(localStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
    expect(localStorage.setItem).toHaveBeenCalledWith('user_role', 'user');
    
    cleanup();
  });
  
  test('当localStorage访问失败时，应处理错误', () => {
    // 模拟localStorage.getItem抛出错误
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage访问失败');
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 验证错误处理(状态应为未登录)
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-out');
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
}); 