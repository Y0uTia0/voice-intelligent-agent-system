import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import 'antd-mobile/bundle/style.css'
import { worker } from './mocks/browser'

console.log('===== main.jsx 开始执行 =====');
console.log('ReactDOM 版本:', ReactDOM.version);
console.log('React 版本:', React.version);
console.log('环境:', process.env.NODE_ENV);

// 配置MSW
async function setupMSW() {
  console.log('🔄 正在初始化MSW...');
  
  try {
    if (import.meta.env.DEV) {
      // 确保在开发环境下启用MSW
      await worker.start({
        onUnhandledRequest: 'bypass', // 不拦截的请求将被传递
        serviceWorker: {
          url: '/mockServiceWorker.js'
        },
      });
      
      console.log('✅ MSW初始化成功!');
      
      // 将worker暴露到window对象，便于调试
      if (typeof window !== 'undefined') {
        window._mswWorker = worker;
        window.msw = { active: true };
        console.log('MSW已暴露到window._mswWorker和window.msw');
      }
    } else {
      console.log('⏭️ 非开发环境，跳过MSW初始化');
    }
  } catch (error) {
    console.error('❌ MSW初始化失败:', error);
  }
}

// 等待MSW设置完成后渲染应用
(async function initApp() {
  await setupMSW();
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  
  console.log('🚀 React应用渲染完成');
})(); 