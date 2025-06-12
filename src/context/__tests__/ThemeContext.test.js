import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme, ThemeContext } from '../ThemeContext';

// 测试组件，用于访问useTheme
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  // 在每个测试前，清除localStorage并重置document属性
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(document.documentElement, 'setAttribute');
    
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    document.documentElement.setAttribute.mockClear();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('初始化时应该从localStorage中读取主题', () => {
    localStorage.getItem.mockImplementation(() => 'light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(localStorage.getItem).toHaveBeenCalledWith('theme');
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });
  
  test('如果localStorage没有主题，应该使用默认值"dark"', () => {
    localStorage.getItem.mockImplementation(() => null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
  
  test('切换主题应改变theme状态并更新localStorage和文档属性', () => {
    localStorage.getItem.mockImplementation(() => 'light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // 初始主题应为light
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    
    // 切换主题
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });
    
    // 切换后主题应为dark
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    
    // 再次切换
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });
    
    // 切换回light
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });
  
  test('useTheme hook应该返回正确的上下文值', () => {
    let contextValue = null;
    
    const ContextCapture = () => {
      contextValue = useTheme();
      return null;
    };
    
    render(
      <ThemeProvider>
        <ContextCapture />
      </ThemeProvider>
    );
    
    expect(contextValue).toHaveProperty('theme');
    expect(contextValue).toHaveProperty('toggleTheme');
    expect(typeof contextValue.toggleTheme).toBe('function');
  });
}); 