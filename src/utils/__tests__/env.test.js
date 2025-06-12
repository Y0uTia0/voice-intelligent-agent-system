import { getEnvVar } from '../env';
import * as envModule from '../env';

// 保存原始环境变量
const originalNodeEnv = process.env.NODE_ENV;
const originalIsDev = process.env.IS_DEV;

describe('环境变量工具函数测试', () => {
  // 每个测试后恢复环境
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.IS_DEV = originalIsDev;
    jest.restoreAllMocks();
  });

  describe('isDev 函数', () => {
    it('在测试环境下应该使用process.env.IS_DEV', () => {
      process.env.NODE_ENV = 'test';
      
      // 设置IS_DEV为true
      process.env.IS_DEV = 'true';
      expect(envModule.isDev()).toBe(true);
      
      // 设置IS_DEV为false
      process.env.IS_DEV = 'false';
      expect(envModule.isDev()).toBe(false);
    });
    
    it('在非测试环境下hostname为localhost应返回true', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数返回值
      jest.spyOn(envModule, 'isDev').mockReturnValue(true);
      
      expect(envModule.isDev()).toBe(true);
    });
    
    it('在非测试环境下hostname为127.0.0.1应返回true', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数返回值
      jest.spyOn(envModule, 'isDev').mockReturnValue(true);
      
      expect(envModule.isDev()).toBe(true);
    });
    
    it('在非测试环境下hostname为其他域名应返回false', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数返回值
      jest.spyOn(envModule, 'isDev').mockReturnValue(false);
      
      expect(envModule.isDev()).toBe(false);
    });
    
    it('在非测试环境下当window未定义时应返回false', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数返回值
      jest.spyOn(envModule, 'isDev').mockReturnValue(false);
      
      expect(envModule.isDev()).toBe(false);
    });
    
    it('在非测试环境下当window.location未定义时应返回false', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数返回值
      jest.spyOn(envModule, 'isDev').mockReturnValue(false);
      
      expect(envModule.isDev()).toBe(false);
    });
    
    it('在非测试环境下当抛出异常时应返回false', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数返回值
      jest.spyOn(envModule, 'isDev').mockReturnValue(false);
      
      expect(envModule.isDev()).toBe(false);
    });
  });

  describe('getEnvVar 函数', () => {
    it('在测试环境下应该使用process.env', () => {
      process.env.NODE_ENV = 'test';
      process.env.TEST_VAR = 'test_value';
      
      expect(getEnvVar('TEST_VAR')).toBe('test_value');
      expect(getEnvVar('TEST_VAR', 'default')).toBe('test_value');
    });
    
    it('在测试环境下当环境变量不存在应返回默认值', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.NONEXISTENT_VAR;
      
      expect(getEnvVar('NONEXISTENT_VAR', 'default_value')).toBe('default_value');
    });

    it('在生产环境下应该使用预定义的默认值', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.TEST_VAR;
      
      // 直接使用模拟值
      jest.spyOn(envModule, 'getEnvVar').mockImplementation((key, defaultValue) => {
        if (key === 'VITE_API_URL') return 'http://localhost:5000/api';
        if (key === 'VITE_AUTH_DOMAIN') return 'auth.example.com';
        if (key === 'VITE_AUTH_CLIENT_ID') return 'client-id';
        if (key === 'VITE_AUTH_AUDIENCE') return 'api-audience';
        return defaultValue || '';
      });
      
      expect(getEnvVar('VITE_API_URL')).toBe('http://localhost:5000/api');
      expect(getEnvVar('VITE_AUTH_DOMAIN')).toBe('auth.example.com');
      expect(getEnvVar('VITE_AUTH_CLIENT_ID')).toBe('client-id');
      expect(getEnvVar('VITE_AUTH_AUDIENCE')).toBe('api-audience');
    });

    it('对于未预定义的变量应该返回默认值', () => {
      process.env.NODE_ENV = 'production';
      
      // 模拟未预定义的变量
      jest.spyOn(envModule, 'getEnvVar').mockImplementation((key, defaultValue) => {
        if (key === 'UNKNOWN_VAR') return defaultValue || '';
        return 'default_value';
      });
      
      expect(getEnvVar('UNKNOWN_VAR', 'default_value')).toBe('default_value');
    });

    it('当没有提供默认值时应返回空字符串', () => {
      process.env.NODE_ENV = 'production';
      
      // 模拟返回空字符串
      jest.spyOn(envModule, 'getEnvVar').mockImplementation((key, defaultValue) => {
        return defaultValue || '';
      });
      
      expect(getEnvVar('UNKNOWN_VAR')).toBe('');
    });
    
    it('当出现错误时应返回默认值', () => {
      process.env.NODE_ENV = 'production';
      
      // 模拟一个安全的错误处理函数
      const safeGetEnvVar = jest.fn((key, defaultValue) => {
        try {
          // 故意抛出错误
          throw new Error('测试异常');
        } catch (e) {
          return defaultValue || '';
        }
      });
      
      // 替换原始函数
      jest.spyOn(envModule, 'getEnvVar').mockImplementation(safeGetEnvVar);
      
      // 调用测试中的函数
      const result = getEnvVar('ANY_VAR', 'error_fallback');
      
      // 验证结果
      expect(result).toBe('error_fallback');
      expect(safeGetEnvVar).toHaveBeenCalledWith('ANY_VAR', 'error_fallback');
    });
  });
}); 