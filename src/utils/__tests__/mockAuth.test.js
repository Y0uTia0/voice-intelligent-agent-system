import { setupMockAuth, clearMockAuth } from '../mockAuth';

describe('模拟认证工具函数测试', () => {
  // 备份原始console.log
  const originalConsoleLog = console.log;
  
  beforeEach(() => {
    // 在每次测试前清除localStorage和mock console.log
    localStorage.clear();
    console.log = jest.fn();
  });
  
  afterEach(() => {
    // 恢复原始console.log
    console.log = originalConsoleLog;
  });
  
  describe('setupMockAuth 函数', () => {
    it('当认证信息不存在时应设置模拟认证信息并返回true', () => {
      // 确保localStorage为空
      expect(localStorage.getItem('auth_token')).toBeNull();
      
      // 调用函数
      const result = setupMockAuth();
      
      // 验证返回值
      expect(result).toBe(true);
      
      // 验证localStorage中的值
      expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('user_id')).toBe('1');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(localStorage.getItem('user_role')).toBe('user');
      
      // 验证console.log调用
      expect(console.log).toHaveBeenCalledWith('setupMockAuth: 设置模拟认证状态...');
      expect(console.log).toHaveBeenCalledWith('setupMockAuth: 模拟认证信息设置完成');
    });
    
    it('当认证信息已存在时应不进行设置并返回false', () => {
      // 预先设置认证信息
      localStorage.setItem('auth_token', 'existing-token');
      localStorage.setItem('user_id', '2');
      
      // 调用函数
      const result = setupMockAuth();
      
      // 验证返回值
      expect(result).toBe(false);
      
      // 验证localStorage中的值保持不变
      expect(localStorage.getItem('auth_token')).toBe('existing-token');
      expect(localStorage.getItem('user_id')).toBe('2');
      
      // 验证console.log调用
      expect(console.log).toHaveBeenCalledWith('setupMockAuth: 已存在认证信息，无需设置');
    });
  });
  
  describe('clearMockAuth 函数', () => {
    it('应清除所有认证信息', () => {
      // 预先设置认证信息
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('user_role', 'user');
      
      // 调用函数
      clearMockAuth();
      
      // 验证localStorage中的值已被清除
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_id')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('user_role')).toBeNull();
      
      // 验证console.log调用
      expect(console.log).toHaveBeenCalledWith('clearMockAuth: 清除模拟认证信息');
    });
  });
}); 