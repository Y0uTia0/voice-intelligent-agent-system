// apiClient.js
// 统一的后端 API 客户端

import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/v1/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('auth_token');
    console.log(`🔑 API请求: ${config.method.toUpperCase()} ${config.url}`);
    console.log('请求数据:', config.data);
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('使用认证令牌:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.warn('⚠️ 未找到认证令牌!');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API响应成功: ${response.config.method.toUpperCase()} ${response.config.url}`);
    console.log('响应数据:', response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API响应错误: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('未收到响应. 请求详情:', error.request);
    } else {
      // 设置请求时发生错误
      console.error('请求错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 获取本地存储的 token
export function getToken() {
  return localStorage.getItem('auth_token');
}

// 获取本地存储的 userId
export function getUserId() {
  return localStorage.getItem('user_id');
}

// 登录 - 兼容旧接口
export async function login(username, password) {
  console.log('🔐 尝试登录，用户名:', username);
  try {
    const response = await apiClient.post('/auth/token', {
      username,
      password
    });
    
    // 存储token
    const { access_token, user_id, role } = response.data;
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user_id', user_id);
    localStorage.setItem('user_role', role);
    localStorage.setItem('username', username);
    
    console.log('🔐 登录成功, userId:', user_id);
    
    return response.data;
  } catch (error) {
    console.error('🔐 登录失败:', error);
    throw error;
  }
}

// 注册 - 兼容旧接口
export async function register({ username, email, password }) {
  try {
    const response = await apiClient.post('/auth/register', {
      username, 
      email, 
      password
    });
    console.log('📝 注册成功');
    return response.data;
  } catch (error) {
    console.error('📝 注册失败:', error);
    throw error;
  }
}

// 刷新token - 兼容旧接口
export async function refreshToken() {
  try {
    const token = getToken();
    const response = await apiClient.post('/auth/refresh', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    localStorage.setItem('auth_token', response.data.access_token);
    console.log('🔄 令牌刷新成功');
    return response.data;
  } catch (error) {
    console.error('🔄 令牌刷新失败:', error);
    throw error;
  }
}

// 意图解析 - 兼容旧接口
export async function interpret(query, sessionId = null) {
  try {
    const userId = getUserId();
    console.log('🧠 意图解析调用', { query, sessionId, userId });
    
    if (!userId) {
      console.error('🧠 意图解析失败: 缺少用户ID');
      throw new Error('用户未登录或ID不存在');
    }
    
    const requestBody = {
      query,
      userId: Number(userId)
    };
    
    if (sessionId) {
      requestBody.sessionId = sessionId;
    }
    
    console.log('🧠 意图解析请求体:', requestBody);
    const response = await apiClient.post('/interpret', requestBody);
    
    console.log('🧠 意图解析成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('🧠 意图解析失败:', error);
    throw error;
  }
}

// 工具执行 - 兼容旧接口
export async function executeTool({ sessionId, toolId, params }) {
  try {
    const userId = getUserId();
    console.log('🛠️ 工具执行调用', { sessionId, toolId, params, userId });
    
    const response = await apiClient.post('/execute', {
      sessionId,
      userId: Number(userId),
      toolId,
      params
    });
    
    console.log('🛠️ 工具执行成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('🛠️ 工具执行失败:', error);
    throw error;
  }
}

// 获取工具列表 - 兼容旧接口
export async function getTools() {
  try {
    const response = await apiClient.get('/tools');
    console.log('🧰 获取工具列表成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('🧰 获取工具列表失败:', error);
    throw error;
  }
}

// 通用带认证请求 - 兼容旧接口
export async function apiRequest(path, options = {}) {
  try {
    const token = getToken();
    const config = {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`
      }
    };
    
    // 转换fetch风格的请求为axios风格
    if (options.method) {
      config.method = options.method;
    }
    
    if (options.body) {
      config.data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    }
    
    const response = await apiClient(path, config);
    
    // 模拟fetch的响应格式
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: () => Promise.resolve(response.data)
    };
  } catch (error) {
    console.error('API请求失败:', error);
    
    // 如果是401，尝试刷新token
    if (error.response && error.response.status === 401) {
      try {
        await refreshToken();
        // 重试请求
        return apiRequest(path, options);
      } catch (refreshError) {
        console.error('刷新令牌失败:', refreshError);
        throw refreshError;
      }
    }
    
    throw error;
  }
}

// 导出API客户端实例，便于直接使用
export default apiClient; 