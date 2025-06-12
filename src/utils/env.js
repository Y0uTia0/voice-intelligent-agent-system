/**
 * 环境变量工具函数
 * 为不同环境提供统一的环境变量访问接口
 */

export function isDev() {
  // 测试环境
  if (process.env.NODE_ENV === 'test') {
    return process.env.IS_DEV === 'true';
  }
  
  // 生产环境 - 防止直接访问import.meta
  try {
    // 在非测试环境下，通过动态方式检查
    // 注意：这里不能直接使用import.meta，因为Jest无法处理
    return window?.location?.hostname === 'localhost' || 
           window?.location?.hostname === '127.0.0.1';
  } catch (error) {
    // 默认非开发环境
    return false;
  }
}

export function getEnvVar(name, defaultValue = '') {
  // 测试环境
  if (process.env.NODE_ENV === 'test') {
    return process.env[name] || defaultValue;
  }
  
  // 生产环境
  try {
    // 定义常用环境变量的默认值
    const envDefaults = {
      VITE_API_URL: 'http://localhost:5000/api',
      VITE_AUTH_DOMAIN: 'auth.example.com',
      VITE_AUTH_CLIENT_ID: 'client-id',
      VITE_AUTH_AUDIENCE: 'api-audience'
    };
    
    // 检查预定义的默认环境变量
    if (envDefaults[name]) {
      return envDefaults[name];
    }
    
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
} 