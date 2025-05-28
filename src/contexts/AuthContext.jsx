import React, { createContext, useReducer, useContext, useEffect } from 'react';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null,
  loading: false,
  error: null
};

const ActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
};

function authReducer(state, action) {
  switch (action.type) {
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
    default:
      return state;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 模拟登录
  const login = async (username, password) => {
    // 这里可替换为真实API
    if (username === 'test' && password === '123456') {
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          user: { id: '1', username: 'test' },
          token: 'mock-token',
          role: 'user'
        }
      });
      return true;
    } else {
      dispatch({ type: ActionTypes.LOGIN_FAILURE, payload: '用户名或密码错误' });
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: ActionTypes.LOGOUT });
  };

  const value = {
    ...state,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 