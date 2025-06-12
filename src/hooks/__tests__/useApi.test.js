import { renderHook, act } from '@testing-library/react-hooks';
import { useApi } from '../useApi';

describe('useApi hook', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('应初始化为非加载状态且没有错误', () => {
    const { result } = renderHook(() => useApi());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.request).toBe('function');
  });

  it('应成功发起请求并返回数据', async () => {
    const mockData = { success: true, data: { id: 1, name: '测试数据' }};
    
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      })
    );

    const { result } = renderHook(() => useApi());
    
    let returnedData;
    await act(async () => {
      returnedData = await result.current.request('/test-url');
    });
    
    // 验证请求中的loading状态变化
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // 验证返回数据
    expect(returnedData).toEqual(mockData);
    
    // 验证fetch调用
    expect(global.fetch).toHaveBeenCalledWith('/test-url', {
      headers: { 'Content-Type': 'application/json' }
    });
  });

  it('在发生错误时应正确设置error状态', async () => {
    const mockError = new Error('网络错误');
    
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.reject(mockError)
    );

    const { result } = renderHook(() => useApi());
    
    let error;
    await act(async () => {
      try {
        await result.current.request('/test-url');
      } catch (e) {
        error = e;
      }
    });
    
    // 验证错误处理
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError.message);
    expect(error).toBe(mockError);
  });

  it('应使用提供的选项发起请求', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );

    const { result } = renderHook(() => useApi());
    
    const options = {
      method: 'POST',
      body: JSON.stringify({ id: 1 }),
      headers: {
        'Authorization': 'Bearer token123'
      }
    };
    
    await act(async () => {
      await result.current.request('/test-url', options);
    });
    
    // 验证fetch调用，包含自定义选项
    expect(global.fetch).toHaveBeenCalledWith('/test-url', {
      method: 'POST',
      body: JSON.stringify({ id: 1 }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123'
      }
    });
  });
}); 