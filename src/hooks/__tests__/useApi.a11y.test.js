import React from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useApi } from '../useApi';

// 扩展Jest的期望值以支持无障碍测试
expect.extend(toHaveNoViolations);

// 一个使用useApi的测试组件
function TestComponent() {
  const { request, loading, error } = useApi();
  
  return (
    <div>
      <button 
        onClick={() => request('/test')} 
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? '加载中...' : '发送请求'}
      </button>
      {error && <p role="alert" className="error">{error}</p>}
      <div aria-live="polite">
        {loading && <span>正在加载数据...</span>}
      </div>
    </div>
  );
}

describe('useApi无障碍测试', () => {
  let originalFetch;
  
  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });
  
  afterAll(() => {
    global.fetch = originalFetch;
  });
  
  it('useApi hook应初始化为非加载状态', () => {
    const { result } = renderHook(() => useApi());
    
    expect(result.current.loading).toBe(false);
  });
  
  it('使用useApi的组件不应有无障碍违规', async () => {
    const { container } = render(<TestComponent />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('加载状态下不应有无障碍违规', async () => {
    // 模拟返回一个永不解析的Promise，以保持加载状态
    global.fetch = jest.fn().mockImplementationOnce(() => new Promise(() => {}));
    
    const TestLoadingComponent = () => {
      const { request, loading } = useApi();
      
      // 触发请求开始加载
      React.useEffect(() => {
        request('/test');
      }, [request]);
      
      return (
        <div>
          <button 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? '加载中...' : '发送请求'}
          </button>
          <div aria-live="polite">
            {loading && <span>正在加载数据...</span>}
          </div>
        </div>
      );
    };
    
    const { container } = render(<TestLoadingComponent />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('错误状态下不应有无障碍违规', async () => {
    // 模拟抛出错误
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('API错误')));
    
    const TestErrorComponent = () => {
      const { request, error } = useApi();
      
      // 触发请求以产生错误
      React.useEffect(() => {
        request('/test').catch(() => {});
      }, [request]);
      
      return (
        <div>
          <button>发送请求</button>
          {error && (
            <div role="alert" aria-live="assertive" className="error-message">
              错误: {error}
            </div>
          )}
        </div>
      );
    };
    
    const { container } = render(<TestErrorComponent />);
    
    // 等待错误状态
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 