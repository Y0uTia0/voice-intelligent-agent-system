import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

console.log('MSW浏览器模块初始化中...');

// 这个文件只在浏览器环境中运行
export const worker = setupWorker(...handlers);

// 添加调试函数以便在浏览器控制台手动检查MSW状态
if (typeof window !== 'undefined') {
  window._checkMswStatus = () => {
    console.log('MSW状态检查:');
    console.log('- worker对象存在:', !!worker);
    console.log('- handlers数量:', handlers.length);
    console.log('- window.msw存在:', !!window.msw);
    console.log('- 所有handlers:', handlers);
    return {
      active: !!window.msw?.active,
      handlersCount: handlers.length,
      handlers: handlers
    };
  };
}

console.log('MSW浏览器模块初始化完成, handlers数量:', handlers.length); 