import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useVoice } from '../hooks/useVoice';
import { useTTS } from '../hooks/useTTS';

/**
 * 语音确认组件
 * @param {Object} props
 * @param {string} props.confirmText - 复述文本
 * @param {Function} props.onConfirm - 用户确认回调
 * @param {Function} props.onCancel - 用户取消回调
 * @param {Function} props.onRetry - 用户重试回调
 */
function classifyIntent(text) {
  if (!text) return '';
  if (/确认|是|好的|ok|yes/i.test(text)) return 'CONFIRM';
  if (/取消|否|不|no/i.test(text)) return 'CANCEL';
  return 'RETRY';
}

const VoiceConfirmation = ({ confirmText, onConfirm, onCancel, onRetry }) => {
  const { speak, isSpeaking } = useTTS();
  const { startRecording, stopRecording, transcript } = useVoice();
  const [listening, setListening] = useState(false);

  // 播放复述文本
  useEffect(() => {
    if (confirmText && !isSpeaking) {
      speak(confirmText);
    }
  }, [confirmText, isSpeaking, speak]);

  // 语音播报结束后开始录音
  useEffect(() => {
    if (!isSpeaking && confirmText && !listening) {
      setListening(true);
      startRecording();
    }
  }, [isSpeaking, confirmText, listening, startRecording]);

  // 处理用户回复
  useEffect(() => {
    if (transcript && listening) {
      const intent = classifyIntent(transcript);
      setListening(false);
      stopRecording();
      if (intent === 'CONFIRM') {
        onConfirm && onConfirm();
      } else if (intent === 'CANCEL') {
        onCancel && onCancel();
      } else {
        onRetry && onRetry();
      }
    }
  }, [transcript, listening, onConfirm, onCancel, onRetry, stopRecording]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-base font-semibold mb-2">{confirmText}</div>
      <div className="text-gray-500 text-sm">
        {isSpeaking ? '正在复述...' : listening ? '请语音确认（说“确认”或“取消”）...' : '等待回复...'}
      </div>
      {transcript && <div className="text-blue-600 text-xs">你的回复：{transcript}</div>}
    </div>
  );
};

VoiceConfirmation.propTypes = {
  confirmText: PropTypes.string.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onRetry: PropTypes.func,
};

export default VoiceConfirmation; 