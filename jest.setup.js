// 导入jest-dom扩展
import '@testing-library/jest-dom';

// 配置测试环境变量
process.env.NODE_ENV = 'test';
process.env.IS_DEV = 'false'; // 默认非开发环境

// Mock import.meta
if (typeof global.import === 'undefined') {
  global.import = {};
}

if (typeof global.import.meta === 'undefined') {
  global.import.meta = {
    env: {
      VITE_API_URL: 'http://localhost:5000/api',
      VITE_AUTH_DOMAIN: 'test-domain',
      VITE_AUTH_CLIENT_ID: 'test-client-id',
      VITE_AUTH_AUDIENCE: 'test-audience',
      DEV: false,
      // 添加其他可能用到的环境变量
    }
  };
}

// Mock localStorage
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

// Mock matchMedia
if (typeof global.matchMedia === 'undefined') {
  global.matchMedia = jest.fn(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
} 