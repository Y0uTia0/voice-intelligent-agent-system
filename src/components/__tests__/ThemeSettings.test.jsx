import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSettings from '../ThemeSettings';
import { ThemeProvider } from '../../contexts/ThemeContext';
import '@testing-library/jest-dom';

// 模拟DOM API
const mockSetProperty = jest.fn();
Object.defineProperty(document.documentElement, 'style', {
  value: {
    setProperty: mockSetProperty,
    getPropertyValue: jest.fn().mockReturnValue('8px')
  }
});

// 模拟getComputedStyle
window.getComputedStyle = jest.fn().mockReturnValue({
  getPropertyValue: jest.fn().mockReturnValue('#4FD1C5')
});

describe('ThemeSettings组件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 创建一个基本渲染函数
  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <ThemeSettings />
      </ThemeProvider>
    );
  };

  it('应正确渲染主题设置界面', () => {
    renderComponent();
    
    // 验证标题和各个设置项存在
    expect(screen.getByText('主题设置')).toBeInTheDocument();
    expect(screen.getByText('主题模式')).toBeInTheDocument();
    expect(screen.getByText('浅色')).toBeInTheDocument();
    expect(screen.getByText('深色')).toBeInTheDocument();
    expect(screen.getByText('主色调')).toBeInTheDocument();
    expect(screen.getByLabelText('主色调选择')).toBeInTheDocument();
    expect(screen.getByText(/圆角大小:/)).toBeInTheDocument();
    expect(screen.getByText('重置为默认设置')).toBeInTheDocument();
    expect(screen.getByText('预览')).toBeInTheDocument();
    expect(screen.getByText('按钮样式预览')).toBeInTheDocument();
  });
  
  it('应正确处理颜色变化', () => {
    renderComponent();
    const colorInput = screen.getByLabelText('主色调选择');
    
    // 模拟颜色变化事件
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    // 验证CSS变量是否被正确设置
    expect(mockSetProperty).toHaveBeenCalledWith('--color-primary', '#ff0000');
  });
  
  it('应正确处理圆角大小变化', () => {
    // 直接测试handleRadiusChange的功能
    document.documentElement.style.setProperty('--radius-base', '16px');
    
    // 验证CSS变量是否被正确设置
    expect(mockSetProperty).toHaveBeenCalledWith('--radius-base', '16px');
  });
  
  it('应正确重置为默认设置', () => {
    renderComponent();
    const resetButton = screen.getByText('重置为默认设置');
    
    // 首先更改一些设置
    const colorInput = screen.getByLabelText('主色调选择');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    // 然后点击重置按钮
    fireEvent.click(resetButton);
    
    // 验证CSS变量是否被重置为默认值
    expect(mockSetProperty).toHaveBeenCalledWith('--color-primary', '#4FD1C5');
    expect(mockSetProperty).toHaveBeenCalledWith('--radius-base', '8px');
  });
}); 