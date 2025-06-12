import React from 'react';
import { render, screen } from '@testing-library/react';
import AppLayout from '../AppLayout';
import '@testing-library/jest-dom';

describe('AppLayout组件', () => {
  it('应包含头部、主体和尾部', () => {
    render(
      <AppLayout>
        <div data-testid="test-content">测试内容</div>
      </AppLayout>
    );
    
    // 检查头部元素
    expect(screen.getByText('语音智能代理系统')).toBeInTheDocument();
    
    // 检查子内容被正确渲染
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('测试内容')).toBeInTheDocument();
    
    // 检查尾部元素包含版权信息
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} 智能语音系统 All Rights Reserved.`)).toBeInTheDocument();
  });
  
  it('应接受不同的子元素', () => {
    render(
      <AppLayout>
        <button>按钮</button>
        <p>段落</p>
      </AppLayout>
    );
    
    // 检查不同类型的子元素都被正确渲染
    expect(screen.getByText('按钮')).toBeInTheDocument();
    expect(screen.getByText('段落')).toBeInTheDocument();
  });
}); 