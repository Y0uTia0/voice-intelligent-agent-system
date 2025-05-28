import React, { useCallback } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import VoiceRecorder from '../components/VoiceRecorder';
import VoiceConfirmation from '../components/VoiceConfirmation';

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
    // 模拟意图解析
    setTimeout(() => {
      setSessionId('mock-session-1');
      setConfirmText(`你要执行的操作是：${text}，请确认`);
      setToolCalls([{ tool_id: 'mock-tool', parameters: { text } }]);
      setStage('confirming');
    }, 1000);
  }, [isAuthenticated, setError, setStage, setSessionId, setConfirmText, setToolCalls]);

  // 处理确认
  const handleConfirm = useCallback(async () => {
    setStage('executing');
    // 模拟工具执行
    setTimeout(() => {
      setResult({ message: '操作已成功执行！' });
      setStage('completed');
    }, 1200);
  }, [setStage, setResult]);

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
    <div className="max-w-xl mx-auto p-4">
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
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <div className="text-green-700 font-bold mb-2">执行结果</div>
          <div className="text-green-900">{result?.message}</div>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => { reset(); setStage('idle'); }}>重新开始</button>
        </div>
      )}
      {/* 错误显示 */}
      {error && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-red-700">
          <p>{error}</p>
          <button className="mt-2 px-3 py-1 bg-red-500 text-white rounded" onClick={() => setError(null)}>关闭</button>
        </div>
      )}
    </div>
  );
}

export default MainPage; 