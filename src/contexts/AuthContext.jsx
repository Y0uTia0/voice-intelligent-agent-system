import React, { createContext, useReducer, useContext, useEffect } from 'react';

// 初始状态
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null,
  loading: true,
  error: null
};

// 动作类型
const ActionTypes = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN'
};

// Reducer 函数
function authReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN_REQUEST:
      return { ...state, loading: true, error: null };
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
        loading: false,
        error: null
      };
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        role: null,
        loading: false,
        error: action.payload
      };
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        loading: false
      };
    case ActionTypes.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload
      };
    default:
      return state;
  }
}

// 创建上下文
const AuthContext = createContext();

// 认证提供者组件
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // 从 localStorage 恢复认证状态
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('user_role');
    
    if (token && userId && username) {
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          token,
          user: { id: userId, username },
          role
        }
      });
    } else {
      dispatch({ type: ActionTypes.LOGOUT });
    }
  }, []);
  
  // 登录方法
  const loginUser = async (username, password) => {
    dispatch({ type: ActionTypes.LOGIN_REQUEST });
    
    try {
      console.log('AuthContext: 尝试登录，用户名:', username);
      
      // 创建表单数据
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      console.log('AuthContext: 请求体:', formData.toString());
      console.log('AuthContext: 登录URL:', '/auth/token');
      
      const response = await fetch('/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });
      
      if (!response.ok) {
        console.error('AuthContext: 登录失败，状态码:', response.status);
        const errorText = await response.text();
        console.error('AuthContext: 错误详情:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || '登录失败');
        } catch (e) {
          throw new Error(`登录失败: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('AuthContext: 登录成功，响应:', data);
      
      // 保存认证信息到 localStorage
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', data.username);
      localStorage.setItem('user_role', data.role);
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          token: data.access_token,
          user: { id: data.user_id, username: data.username },
          role: data.role
        }
      });
      
      return data;
    } catch (error) {
      console.error('AuthContext: 登录失败:', error);
      
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: error.message
      });
      
      throw error;
    }
  };
  
  // 刷新令牌方法
  const refreshUserToken = async () => {
    try {
      const response = await fetch('/v1/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('刷新令牌失败');
      }
      
      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      
      dispatch({
        type: ActionTypes.REFRESH_TOKEN,
        payload: data.access_token
      });
      
      return data.access_token;
    } catch (error) {
      dispatch({ type: ActionTypes.LOGOUT });
      throw error;
    }
  };
  
  // 登出方法
  const logoutUser = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    
    dispatch({ type: ActionTypes.LOGOUT });
  };
  
  const value = {
    ...state,
    login: loginUser,
    logout: logoutUser,
    refreshToken: refreshUserToken
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 