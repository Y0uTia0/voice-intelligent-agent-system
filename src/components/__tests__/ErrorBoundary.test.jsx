import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// 一个会抛出错误的测试组件
function ErrorComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('测试错误');
  }
  return <div>正常组件</div>;
}

// 由于React会在控制台打印错误，我们可以暂时禁用这些警告
const originalConsoleError = console.error;

describe('ErrorBoundary组件', () => {
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  it('当没有错误时应正常渲染子组件', () => {
    render(
      <ErrorBoundary>
        <div>测试内容</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('测试内容')).toBeInTheDocument();
  });
  
  it('当子组件抛出错误时应显示错误UI', () => {
    // 注意：React 不会在测试过程中应用 componentDidCatch 中的错误处理
    // 因此我们需要抑制React的错误边界测试警告
    
    // 暂时禁用控制台错误日志以避免测试输出混乱
    const originalError = console.error;
    console.error = jest.fn();
    
    // 触发错误边界
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 验证错误UI
    expect(screen.getByText('出错了！')).toBeInTheDocument();
    expect(screen.getByText('测试错误')).toBeInTheDocument();
    
    // 恢复控制台错误日志
    console.error = originalError;
  });
  
  it('componentDidCatch应捕获并记录错误', () => {
    // 创建一个spy来监视componentDidCatch方法
    jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');
    
    // 暂时禁用控制台错误日志
    const originalError = console.error;
    console.error = jest.fn();
    
    // 触发错误边界
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 验证componentDidCatch被调用
    expect(ErrorBoundary.prototype.componentDidCatch).toHaveBeenCalled();
    
    // 恢复控制台错误日志
    console.error = originalError;
  });
  
  it('当子组件恢复正常时应不再显示错误UI', () => {
    // 首先使用一个抛出错误的组件
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 验证错误UI被显示
    expect(screen.getByText('出错了！')).toBeInTheDocument();
    
    // 然后重新渲染一个新的ErrorBoundary实例
    // 注意：在实际应用中，需要重置ErrorBoundary的状态，
    // 这里我们通过重新渲染整个组件来模拟
    rerender(
      <ErrorBoundary key="new-instance">
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // 验证现在显示的是正常组件
    expect(screen.getByText('正常组件')).toBeInTheDocument();
    expect(screen.queryByText('出错了！')).not.toBeInTheDocument();
  });
}); 