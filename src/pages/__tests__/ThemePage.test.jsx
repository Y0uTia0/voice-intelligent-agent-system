import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemePage from '../ThemePage';
import AppLayout from '../../components/Layout/AppLayout';
import ThemeSettings from '../../components/ThemeSettings';

// 模拟依赖
jest.mock('../../components/Layout/AppLayout', () => ({ children }) => (
  <div data-testid="mock-app-layout">{children}</div>
));

jest.mock('../../components/ThemeSettings', () => () => (
  <div data-testid="mock-theme-settings">主题设置组件</div>
));

describe('ThemePage 组件', () => {
  it('应正确渲染ThemeSettings组件并包裹在AppLayout中', () => {
    render(<ThemePage />);
    
    // 验证布局组件被正确渲染
    const layoutElement = screen.getByTestId('mock-app-layout');
    expect(layoutElement).toBeInTheDocument();
    
    // 验证ThemeSettings组件被正确渲染
    const themeSettingsElement = screen.getByTestId('mock-theme-settings');
    expect(themeSettingsElement).toBeInTheDocument();
    expect(themeSettingsElement).toHaveTextContent('主题设置组件');
  });
  
  it('应将ThemeSettings作为子组件传递给AppLayout', () => {
    render(<ThemePage />);
    
    // 验证AppLayout组件包含ThemeSettings组件
    const layoutElement = screen.getByTestId('mock-app-layout');
    const themeSettingsElement = screen.getByTestId('mock-theme-settings');
    
    expect(layoutElement).toContainElement(themeSettingsElement);
  });
}); 