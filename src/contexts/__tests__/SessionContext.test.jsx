import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { SessionProvider, useSession } from '../SessionContext';

describe('SessionContext', () => {
  // 用于渲染和测试SessionContext的辅助组件
  const renderSessionContext = () => {
    const TestComponent = () => {
      const session = useSession();
      return (
        <div>
          <div data-testid="session-id">{session.sessionId || 'no-session'}</div>
          <div data-testid="stage">{session.stage || 'no-stage'}</div>
          <div data-testid="status-message">{session.statusMessage || 'no-message'}</div>
          <div data-testid="confirm-text">{session.confirmText || 'no-confirm'}</div>
          <button 
            data-testid="set-session-btn" 
            onClick={() => session.setSessionId('test-session')}
          >
            Set Session
          </button>
          <button 
            data-testid="set-stage-btn" 
            onClick={() => session.setStage('recording')}
          >
            Set Stage
          </button>
          <button 
            data-testid="set-status-btn" 
            onClick={() => session.setStatusMessage('Processing...')}
          >
            Set Status
          </button>
          <button 
            data-testid="set-tool-calls-btn" 
            onClick={() => session.setToolCalls([{ name: 'test-tool' }])}
          >
            Set Tools
          </button>
          <button 
            data-testid="set-confirm-btn" 
            onClick={() => session.setConfirmText('Confirm action?')}
          >
            Set Confirm
          </button>
          <button 
            data-testid="set-result-btn" 
            onClick={() => session.setResult({ success: true })}
          >
            Set Result
          </button>
          <button 
            data-testid="set-error-btn" 
            onClick={() => session.setError('Test error')}
          >
            Set Error
          </button>
          <button 
            data-testid="reset-btn" 
            onClick={() => session.reset()}
          >
            Reset
          </button>
        </div>
      );
    };
    
    return render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );
  };
  
  describe('初始状态', () => {
    it('应提供正确的初始状态', () => {
      renderSessionContext();
      
      expect(screen.getByTestId('session-id').textContent).toBe('no-session');
      expect(screen.getByTestId('stage').textContent).toBe('idle');
      expect(screen.getByTestId('status-message').textContent).toBe('no-message');
      expect(screen.getByTestId('confirm-text').textContent).toBe('no-confirm');
    });
  });
  
  describe('Action方法', () => {
    it('setSessionId应正确更新sessionId', () => {
      const { getByTestId } = renderSessionContext();
      
      act(() => {
        getByTestId('set-session-btn').click();
      });
      
      expect(getByTestId('session-id').textContent).toBe('test-session');
    });
    
    it('setStage应正确更新stage', () => {
      const { getByTestId } = renderSessionContext();
      
      act(() => {
        getByTestId('set-stage-btn').click();
      });
      
      expect(getByTestId('stage').textContent).toBe('recording');
    });
    
    it('setStatusMessage应正确更新statusMessage', () => {
      const { getByTestId } = renderSessionContext();
      
      act(() => {
        getByTestId('set-status-btn').click();
      });
      
      expect(getByTestId('status-message').textContent).toBe('Processing...');
    });
    
    it('setConfirmText应正确更新confirmText', () => {
      const { getByTestId } = renderSessionContext();
      
      act(() => {
        getByTestId('set-confirm-btn').click();
      });
      
      expect(getByTestId('confirm-text').textContent).toBe('Confirm action?');
    });
    
    it('reset应重置状态但保留sessionId', () => {
      const { getByTestId } = renderSessionContext();
      
      // 设置多个状态
      act(() => {
        getByTestId('set-session-btn').click();
        getByTestId('set-stage-btn').click();
        getByTestId('set-status-btn').click();
      });
      
      // 验证状态已设置
      expect(getByTestId('session-id').textContent).toBe('test-session');
      expect(getByTestId('stage').textContent).toBe('recording');
      expect(getByTestId('status-message').textContent).toBe('Processing...');
      
      // 重置
      act(() => {
        getByTestId('reset-btn').click();
      });
      
      // 验证重置后的状态
      expect(getByTestId('session-id').textContent).toBe('test-session'); // 保留sessionId
      expect(getByTestId('stage').textContent).toBe('idle');
      expect(getByTestId('status-message').textContent).toBe('no-message');
    });
  });
  
  describe('useSession Hook', () => {
    it('在独立组件中验证Provider外使用hook', () => {
      // 通过测试渲染一个使用但不包含Provider的组件
      const ErrorComponent = () => {
        try {
          // 在Provider外使用hook会抛出错误
          useSession();
          return <div>不应渲染</div>;
        } catch (error) {
          // 验证错误信息
          expect(error.message).toContain('useSession must be used within a SessionProvider');
          return <div>捕获到预期错误</div>;
        }
      };
      
      render(<ErrorComponent />);
      
      // 如果渲染成功，说明错误被捕获并处理了
      expect(screen.getByText('捕获到预期错误')).toBeInTheDocument();
    });
    
    it('应提供所有必要的方法和状态', () => {
      const wrapper = ({ children }) => <SessionProvider>{children}</SessionProvider>;
      const { result } = renderHook(() => useSession(), { wrapper });
      
      // 验证状态
      expect(result.current).toHaveProperty('sessionId');
      expect(result.current).toHaveProperty('stage');
      expect(result.current).toHaveProperty('statusMessage');
      expect(result.current).toHaveProperty('toolCalls');
      expect(result.current).toHaveProperty('confirmText');
      expect(result.current).toHaveProperty('result');
      expect(result.current).toHaveProperty('error');
      
      // 验证方法
      expect(typeof result.current.setSessionId).toBe('function');
      expect(typeof result.current.setStage).toBe('function');
      expect(typeof result.current.setStatusMessage).toBe('function');
      expect(typeof result.current.setToolCalls).toBe('function');
      expect(typeof result.current.setConfirmText).toBe('function');
      expect(typeof result.current.setResult).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
    
    it('应正确触发状态更新', () => {
      const wrapper = ({ children }) => <SessionProvider>{children}</SessionProvider>;
      const { result } = renderHook(() => useSession(), { wrapper });
      
      // 更新sessionId
      act(() => {
        result.current.setSessionId('new-session');
      });
      expect(result.current.sessionId).toBe('new-session');
      
      // 更新stage
      act(() => {
        result.current.setStage('executing');
      });
      expect(result.current.stage).toBe('executing');
      
      // 更新结果
      const testResult = { data: 'test result' };
      act(() => {
        result.current.setResult(testResult);
      });
      expect(result.current.result).toEqual(testResult);
      
      // 更新错误
      act(() => {
        result.current.setError('Test error message');
      });
      expect(result.current.error).toBe('Test error message');
    });
  });
}); 