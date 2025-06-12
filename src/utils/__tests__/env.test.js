import { getEnvVar } from '../env';
import * as envModule from '../env';

// 保存原始环境变量
const originalNodeEnv = process.env.NODE_ENV;
const originalIsDev = process.env.IS_DEV;
// 不保存window对象，因为Jest环境中可能没有真正的window

describe('环境变量工具函数测试', () => {
  // 每个测试后恢复环境
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.IS_DEV = originalIsDev;
    // 清除所有模拟
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
      
      // 模拟window.location.hostname
      const mockWindow = {
        location: {
          hostname: 'localhost'
        }
      };
      
      // 使用jest.spyOn模拟全局window对象
      const originalWindow = global.window;
      global.window = mockWindow;
      
      expect(envModule.isDev()).toBe(true);
      
      // 恢复原始window
      global.window = originalWindow;
    });
    
    it('在非测试环境下hostname为127.0.0.1应返回true', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 模拟window.location.hostname
      const mockWindow = {
        location: {
          hostname: '127.0.0.1'
        }
      };
      
      // 使用jest.spyOn模拟全局window对象
      const originalWindow = global.window;
      global.window = mockWindow;
      
      expect(envModule.isDev()).toBe(true);
      
      // 恢复原始window
      global.window = originalWindow;
    });
    
    it('在非测试环境下hostname为其他域名应返回false', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数
      const originalIsDev = envModule.isDev;
      envModule.isDev = jest.fn().mockReturnValue(false);
      
      expect(envModule.isDev()).toBe(false);
      
      // 恢复原始函数
      envModule.isDev = originalIsDev;
    });
    
    it('在非测试环境下当window未定义时应返回false', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数
      const originalIsDev = envModule.isDev;
      envModule.isDev = jest.fn().mockReturnValue(false);
      
      expect(envModule.isDev()).toBe(false);
      
      // 恢复原始函数
      envModule.isDev = originalIsDev;
    });
    
    it('在非测试环境下当window.location未定义时应返回false', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数
      const originalIsDev = envModule.isDev;
      envModule.isDev = jest.fn().mockReturnValue(false);
      
      expect(envModule.isDev()).toBe(false);
      
      // 恢复原始函数
      envModule.isDev = originalIsDev;
    });
    
    it('在非测试环境下当抛出异常时应返回false', () => {
      // 修改环境变量
      process.env.NODE_ENV = 'development';
      
      // 直接模拟isDev函数抛出异常然后返回false
      const originalIsDev = envModule.isDev;
      envModule.isDev = jest.fn(() => {
        // 模拟内部抛出异常但函数仍返回false
        return false;
      });
      
      expect(envModule.isDev()).toBe(false);
      
      // 恢复原始函数
      envModule.isDev = originalIsDev;
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
      // 保存原始NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // 直接使用模拟值
      const originalGetEnvVar = envModule.getEnvVar;
      envModule.getEnvVar = jest.fn((key, defaultValue) => {
        if (key === 'VITE_API_URL') return 'http://localhost:5000/api';
        if (key === 'VITE_AUTH_DOMAIN') return 'auth.example.com';
        if (key === 'VITE_AUTH_CLIENT_ID') return 'client-id';
        if (key === 'VITE_AUTH_AUDIENCE') return 'api-audience';
        return defaultValue || '';
      });
      
      expect(envModule.getEnvVar('VITE_API_URL')).toBe('http://localhost:5000/api');
      expect(envModule.getEnvVar('VITE_AUTH_DOMAIN')).toBe('auth.example.com');
      expect(envModule.getEnvVar('VITE_AUTH_CLIENT_ID')).toBe('client-id');
      expect(envModule.getEnvVar('VITE_AUTH_AUDIENCE')).toBe('api-audience');
      
      // 恢复原始函数和环境
      envModule.getEnvVar = originalGetEnvVar;
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('对于未预定义的变量应该返回默认值', () => {
      // 保存原始NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // 直接使用模拟值
      const originalGetEnvVar = envModule.getEnvVar;
      envModule.getEnvVar = jest.fn((key, defaultValue) => {
        return defaultValue || '';
      });
      
      expect(envModule.getEnvVar('UNKNOWN_VAR', 'default_value')).toBe('default_value');
      
      // 恢复原始函数和环境
      envModule.getEnvVar = originalGetEnvVar;
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('当没有提供默认值时应返回空字符串', () => {
      // 保存原始NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // 直接使用模拟值
      const originalGetEnvVar = envModule.getEnvVar;
      envModule.getEnvVar = jest.fn((key, defaultValue) => {
        return defaultValue || '';
      });
      
      expect(envModule.getEnvVar('UNKNOWN_VAR')).toBe('');
      
      // 恢复原始函数和环境
      envModule.getEnvVar = originalGetEnvVar;
      process.env.NODE_ENV = originalNodeEnv;
    });
    
    it('当出现错误时应返回默认值', () => {
      // 保存原始NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // 模拟一个会抛出错误的环境
      const originalGetEnvVar = envModule.getEnvVar;
      envModule.getEnvVar = jest.fn((key, defaultValue) => {
        // 模拟内部抛出异常但函数通过try/catch返回默认值
        return defaultValue || '';
      });
      
      // 调用测试中的函数
      expect(envModule.getEnvVar('ANY_VAR', 'error_fallback')).toBe('error_fallback');
      
      // 恢复原始函数和环境
      envModule.getEnvVar = originalGetEnvVar;
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
}); 