import React from 'react';
import { Button } from 'antd-mobile';
import { AudioOutline, StopOutline } from 'antd-mobile-icons';
import { useVoice } from '../hooks/useVoice';
import PropTypes from 'prop-types';

/**
 * 语音录制组件
 * @param {Object} props
 * @param {Function} props.onTranscript - 录音完成后回调，参数为转写文本
 */
const VoiceRecorder = ({ onTranscript }) => {
  const { isRecording, transcript, error, startRecording, stopRecording } = useVoice();

  const handleRecord = () => {
    if (isRecording) {
      const text = stopRecording();
      if (text && onTranscript) onTranscript(text);
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleRecord}
        shape="circle"
        size="large"
        style={{
          background: isRecording ? 'var(--error-color)' : 'var(--color-primary)',
          color: 'var(--text-primary)',
          border: `2px solid ${isRecording ? 'var(--error-color)' : 'var(--color-primary)'}`,
          boxShadow: 'var(--shadow-md)',
          transition: 'background var(--transition-normal) var(--transition-ease), color var(--transition-normal) var(--transition-ease)'
        }}
        aria-label={isRecording ? '停止录音' : '开始录音'}
      >
        {isRecording ? <StopOutline style={{ color: 'var(--text-primary)' }} /> : <AudioOutline style={{ color: 'var(--text-primary)' }} />}
      </Button>
      <div className="text-gray-600 text-sm min-h-[24px]">{isRecording ? '正在录音...' : transcript}</div>
      {error && <div className="text-red-500 text-xs">{error}</div>}
    </div>
  );
};

VoiceRecorder.propTypes = {
  onTranscript: PropTypes.func,
};

export default VoiceRecorder; 