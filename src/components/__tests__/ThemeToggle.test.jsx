import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider, THEMES } from '../../contexts/ThemeContext';

// 模拟ThemeContext
jest.mock('../../contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('../../contexts/ThemeContext');
  return {
    ...originalModule,
    useTheme: jest.fn(),
  };
});

import { useTheme } from '../../contexts/ThemeContext';

describe('ThemeToggle组件', () => {
  let mockSetTheme;
  
  beforeEach(() => {
    mockSetTheme = jest.fn();
  });
  
  it('在亮色模式下应显示月亮图标', () => {
    // 模拟亮色主题
    useTheme.mockReturnValue({
      theme: THEMES.LIGHT,
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: '切换主题模式' });
    expect(button).toHaveTextContent('🌙');
  });
  
  it('在暗色模式下应显示太阳图标', () => {
    // 模拟暗色主题
    useTheme.mockReturnValue({
      theme: THEMES.DARK,
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: '切换主题模式' });
    expect(button).toHaveTextContent('☀️');
  });
  
  it('点击按钮应调用setTheme切换主题', () => {
    // 模拟亮色主题
    useTheme.mockReturnValue({
      theme: THEMES.LIGHT,
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: '切换主题模式' });
    fireEvent.click(button);
    
    // 应调用setTheme并传入DARK主题
    expect(mockSetTheme).toHaveBeenCalledWith(THEMES.DARK);
  });
  
  it('再次点击按钮应切换回之前的主题', () => {
    // 首先模拟暗色主题
    useTheme.mockReturnValue({
      theme: THEMES.DARK,
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: '切换主题模式' });
    fireEvent.click(button);
    
    // 应调用setTheme并传入LIGHT主题
    expect(mockSetTheme).toHaveBeenCalledWith(THEMES.LIGHT);
  });
  
  it('应使用适当的无障碍标签', () => {
    useTheme.mockReturnValue({
      theme: THEMES.LIGHT,
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: '切换主题模式' });
    expect(button).toHaveAttribute('aria-label', '切换主题模式');
  });
  
  it('应添加正确的CSS类名', () => {
    useTheme.mockReturnValue({
      theme: THEMES.LIGHT,
      setTheme: mockSetTheme,
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('theme-toggle-btn');
  });
}); 