import React, { useCallback } from 'react';
import { useSession } from '../contexts/SessionContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import VoiceRecorder from '../components/VoiceRecorder';
import VoiceConfirmation from '../components/VoiceConfirmation';
import AppLayout from '../components/Layout/AppLayout.jsx';
import { interpret, executeTool } from '../services/apiClient';

function MainPage() {
  const {
    sessionId,
    stage,
    toolCalls,
    confirmText,
    result,
    error,
    setSessionId,
    setStage,
    setToolCalls,
    setConfirmText,
    setResult,
    setError,
    reset
  } = useSession();
  const { isAuthenticated, user } = useAuth();

  // 处理语音转写文本
  const handleTranscript = useCallback(async (text) => {
    if (!isAuthenticated) {
      setError('请先登录');
      return;
    }
    setStage('interpreting');
    try {
      const data = await interpret(text, sessionId);
      setSessionId(data.sessionId);
      setConfirmText(data.confirmText);
      setToolCalls(data.tool_calls);
      setStage('confirming');
    } catch (e) {
      setError(e.message);
      setStage('idle');
    }
  }, [isAuthenticated, setError, setStage, setSessionId, setConfirmText, setToolCalls, sessionId]);

  // 处理确认
  const handleConfirm = useCallback(async () => {
    setStage('executing');
    try {
      const toolCall = toolCalls && toolCalls[0];
      if (!toolCall) throw new Error('无可用工具');
      const resultData = await executeTool({
        sessionId,
        toolId: toolCall.tool_id,
        params: toolCall.parameters
      });
      setResult({ message: resultData.data?.tts_message || '操作已成功执行！' });
      setStage('completed');
    } catch (e) {
      setError(e.message);
      setStage('idle');
    }
  }, [setStage, setResult, toolCalls, sessionId, setError]);

  // 处理取消
  const handleCancel = useCallback(() => {
    reset();
    setStage('idle');
  }, [reset, setStage]);

  // 处理重试
  const handleRetry = useCallback(() => {
    setStage('recording');
  }, [setStage]);

  return (
    <AppLayout>
      <div className="w-full flex flex-col items-center gap-6">
        {/* 语音录制控件 */}
        {(stage === 'idle' || stage === 'recording') && (
          <VoiceRecorder onTranscript={handleTranscript} />
        )}
        {/* 确认界面 */}
        {stage === 'confirming' && (
          <VoiceConfirmation
            confirmText={confirmText}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onRetry={handleRetry}
          />
        )}
        {/* 结果展示 */}
        {(stage === 'executing' || stage === 'completed') && (
          <div className="w-full max-w-md mt-6 p-4 bg-green-50 border border-green-200 rounded shadow-md">
            <div className="text-green-700 font-bold mb-2">执行结果</div>
            <div className="text-green-900">{result?.message}</div>
            <button className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded" onClick={() => { reset(); setStage('idle'); }}>重新开始</button>
          </div>
        )}
        {/* 错误显示 */}
        {error && (
          <div className="w-full max-w-md mt-4 p-2 bg-red-50 border border-red-200 rounded text-red-700">
            <p>{error}</p>
            <button className="mt-2 px-3 py-1 bg-red-500 text-white rounded" onClick={() => setError(null)}>关闭</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default MainPage; 