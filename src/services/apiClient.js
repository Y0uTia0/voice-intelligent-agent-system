// apiClient.js
// 统一的后端 API 客户端

const BASE_URL = 'http://localhost:8000/v1/api';

// 获取本地存储的 token
function getToken() {
  return localStorage.getItem('auth_token');
}

// 获取本地存储的 userId
function getUserId() {
  return localStorage.getItem('user_id');
}

// 登录
export async function login(username, password) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  const response = await fetch(`${BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || '登录失败');
  }
  const data = await response.json();
  localStorage.setItem('auth_token', data.access_token);
  localStorage.setItem('user_role', data.role);
  localStorage.setItem('user_id', data.user_id);
  return data;
}

// 注册
export async function register({ username, email, password }) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password })
  });
  if (!response.ok) {
    throw new Error('注册失败');
  }
  return await response.json();
}

// 刷新 token
export async function refreshToken() {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('刷新令牌失败');
  }
  const data = await response.json();
  localStorage.setItem('auth_token', data.access_token);
  return data;
}

// 通用带认证请求
export async function apiRequest(path, options = {}) {
  let token = getToken();
  let response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
    },
  });
  // 处理 401 自动刷新 token
  if (response.status === 401) {
    try {
      await refreshToken();
      token = getToken();
      response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (e) {
      window.location.href = '/login';
      throw new Error('会话已过期，请重新登录');
    }
  }
  return response;
}

// 意图解析
export async function interpret(query, sessionId = null) {
  const userId = getUserId();
  const body = {
    query,
    userId: Number(userId),
  };
  if (sessionId) body.sessionId = sessionId;
  const response = await apiRequest('/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || '意图解析失败');
  }
  return await response.json();
}

// 工具执行
export async function executeTool({ sessionId, toolId, params }) {
  const userId = getUserId();
  const body = {
    sessionId,
    userId: Number(userId),
    toolId,
    params
  };
  const response = await apiRequest('/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || '工具执行失败');
  }
  return await response.json();
}

// 获取工具列表
export async function getTools() {
  const response = await apiRequest('/tools', {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error('获取工具列表失败');
  }
  return await response.json();
} 