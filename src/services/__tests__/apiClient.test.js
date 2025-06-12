import axios from 'axios';
import apiClient, {
  getToken,
  getUserId,
  login,
  register,
  refreshToken,
  interpret,
  executeTool,
  getTools,
  apiRequest
} from '../apiClient';

// 模拟axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    defaults: { 
      headers: { 
        common: {} 
      }
    }
  };
  return mockAxios;
});

describe('API客户端', () => {
  // 在每个测试前设置
  beforeEach(() => {
    // 模拟localStorage
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');
    
    // 重置模拟
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
    
    // 重置axios模拟
    axios.get.mockClear();
    axios.post.mockClear();
    
    // 模拟console方法
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  // 在每个测试后清理
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('基础函数', () => {
    test('getToken应该从localStorage获取auth_token', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'test-token';
        return null;
      });
      
      const token = getToken();
      expect(token).toBe('test-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    });
    
    test('getUserId应该从localStorage获取user_id', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'user_id') return 'test-user';
        return null;
      });
      
      const userId = getUserId();
      expect(userId).toBe('test-user');
      expect(localStorage.getItem).toHaveBeenCalledWith('user_id');
    });
  });
  
  describe('认证功能', () => {
    test('登录成功应该存储token和用户信息', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          user_id: 'test-user',
          role: 'user'
        }
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await login('testuser', 'password');
      
      expect(axios.post).toHaveBeenCalledWith('/auth/token', {
        username: 'testuser',
        password: 'password'
      });
      
      expect(result).toEqual({
        access_token: 'test-token',
        user_id: 'test-user',
        role: 'user'
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user_id', 'test-user');
      expect(localStorage.setItem).toHaveBeenCalledWith('user_role', 'user');
      expect(localStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
    });
    
    test('登录失败应该抛出错误', async () => {
      const errorResponse = new Error('Authentication failed');
      errorResponse.response = { status: 401, data: { message: '认证失败' } };
      axios.post.mockRejectedValueOnce(errorResponse);
      
      await expect(login('testuser', 'wrong-password')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('🔐 登录失败'));
    });
    
    test('刷新token成功应该更新localStorage', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'old-token';
        return null;
      });
      
      const mockResponse = {
        data: { access_token: 'new-token' }
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await refreshToken();
      
      expect(axios.post).toHaveBeenCalledWith('/auth/refresh', {}, {
        headers: { 'Authorization': 'Bearer old-token' }
      });
      
      expect(result).toEqual({ access_token: 'new-token' });
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
    });
  });
  
  describe('意图解析', () => {
    test('意图解析在没有userId时应该抛出错误', async () => {
      localStorage.getItem.mockImplementation(() => null);
      
      await expect(interpret('你好')).rejects.toThrow('用户未登录或ID不存在');
      expect(console.error).toHaveBeenCalledWith('🧠 意图解析失败: 缺少用户ID');
    });
    
    test('意图解析成功应该返回响应数据', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'user_id') return '123';
        return null;
      });
      
      const mockResponse = {
        data: { 
          intent: 'greeting',
          confidence: 0.95
        }
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await interpret('你好');
      
      expect(axios.post).toHaveBeenCalledWith('/interpret', {
        query: '你好',
        userId: 123,
        sessionId: expect.any(String)
      });
      
      expect(result).toEqual({ 
        intent: 'greeting',
        confidence: 0.95
      });
    });
  });
  
  describe('工具执行', () => {
    test('executeTool应该发送正确的参数', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'user_id') return '123';
        return null;
      });
      
      const mockResponse = {
        data: { result: 'success' }
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      await executeTool({
        sessionId: 'session-123',
        toolId: 'calculator',
        params: { a: 1, b: 2 }
      });
      
      // 验证axios接收到正确的参数
      expect(axios.post).toHaveBeenCalledWith('/execute', {
        sessionId: 'session-123',
        userId: 123,
        toolId: 'calculator',
        params: { a: 1, b: 2 }
      });
    });
  });
  
  describe('工具列表', () => {
    test('getTools应该返回工具列表', async () => {
      const toolsList = [
        { id: 'calculator', name: '计算器' },
        { id: 'translator', name: '翻译器' }
      ];
      
      const mockResponse = { data: toolsList };
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getTools();
      
      expect(axios.get).toHaveBeenCalledWith('/tools');
      expect(result).toEqual(toolsList);
    });
  });
  
  describe('通用API请求', () => {
    test('应正确处理fetch风格的请求', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'test-token';
        return null;
      });
      
      // 模拟axios响应
      const mockResponse = {
        status: 200,
        data: { data: 'success' }
      };
      
      // 确保axios被正确调用并返回模拟响应
      axios.mockImplementationOnce(() => Promise.resolve(mockResponse));
      
      const options = {
        method: 'POST',
        body: { key: 'value' }
      };
      
      const response = await apiRequest('/test', options);
      
      // 验证响应
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({ data: 'success' });
    });
    
    test('应处理401错误并尝试刷新token', async () => {
      // 设置初始token
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'old-token';
        return null;
      });
      
      // 第一次请求返回401
      const errorResponse = new Error('Token expired');
      errorResponse.response = { status: 401, data: { message: 'token已过期' } };
      
      // 刷新token请求
      const refreshResponse = {
        data: { access_token: 'new-token' }
      };
      
      // 刷新后的重试请求
      const retryResponse = {
        status: 200,
        data: { data: 'success' }
      };
      
      // 模拟第一次请求失败
      axios.mockImplementationOnce(() => Promise.reject(errorResponse));
      
      // 模拟刷新token成功
      axios.post.mockResolvedValueOnce(refreshResponse);
      
      // 模拟重试请求成功
      axios.mockImplementationOnce(() => Promise.resolve(retryResponse));
      
      // 执行请求
      const response = await apiRequest('/test', { method: 'GET' });
      
      // 验证token被刷新
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
      
      // 验证最终响应
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual({ data: 'success' });
    });
  });
}); 