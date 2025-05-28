import React, { createContext, useReducer, useContext } from 'react';

const initialState = {
  sessionId: null,
  stage: 'idle', // idle, recording, interpreting, confirming, executing, completed
  statusMessage: null,
  toolCalls: null,
  confirmText: null,
  result: null,
  error: null
};

const ActionTypes = {
  SET_SESSION_ID: 'SET_SESSION_ID',
  SET_STAGE: 'SET_STAGE',
  SET_STATUS_MESSAGE: 'SET_STATUS_MESSAGE',
  SET_TOOL_CALLS: 'SET_TOOL_CALLS',
  SET_CONFIRM_TEXT: 'SET_CONFIRM_TEXT',
  SET_RESULT: 'SET_RESULT',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET'
};

function sessionReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SESSION_ID:
      return { ...state, sessionId: action.payload };
    case ActionTypes.SET_STAGE:
      return { ...state, stage: action.payload };
    case ActionTypes.SET_STATUS_MESSAGE:
      return { ...state, statusMessage: action.payload };
    case ActionTypes.SET_TOOL_CALLS:
      return { ...state, toolCalls: action.payload };
    case ActionTypes.SET_CONFIRM_TEXT:
      return { ...state, confirmText: action.payload };
    case ActionTypes.SET_RESULT:
      return { ...state, result: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionTypes.RESET:
      return { ...initialState, sessionId: state.sessionId };
    default:
      return state;
  }
}

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const setSessionId = (sessionId) => dispatch({ type: ActionTypes.SET_SESSION_ID, payload: sessionId });
  const setStage = (stage) => dispatch({ type: ActionTypes.SET_STAGE, payload: stage });
  const setStatusMessage = (message) => dispatch({ type: ActionTypes.SET_STATUS_MESSAGE, payload: message });
  const setToolCalls = (toolCalls) => dispatch({ type: ActionTypes.SET_TOOL_CALLS, payload: toolCalls });
  const setConfirmText = (text) => dispatch({ type: ActionTypes.SET_CONFIRM_TEXT, payload: text });
  const setResult = (result) => dispatch({ type: ActionTypes.SET_RESULT, payload: result });
  const setError = (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  const reset = () => dispatch({ type: ActionTypes.RESET });

  const value = {
    ...state,
    setSessionId,
    setStage,
    setStatusMessage,
    setToolCalls,
    setConfirmText,
    setResult,
    setError,
    reset
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 