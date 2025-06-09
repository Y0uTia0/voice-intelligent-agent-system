import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useVoice } from '../hooks/useVoice';

/**
 * 语音录制组件
 */
const VoiceRecorder = ({ onTranscript }) => {
  const { isRecording, transcript, error, isSupported, startRecording, stopRecording } = useVoice();

  useEffect(() => {
    console.log('VoiceRecorder组件已渲染');
  }, []);

  const handleRecord = () => {
    console.log('录音按钮点击');
    if (isRecording) {
      const text = stopRecording();
      console.log('停止录音, 文本:', text);
      if (text && onTranscript) onTranscript(text);
    } else {
      console.log('开始录音');
      startRecording();
    }
  };

  return (
    <div className="voice-recorder-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      margin: '20px',
      padding: '20px'
    }}>
      {/* 简单检测浏览器支持 */}
      {!isSupported ? (
        <div style={{
          color: '#F56565',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          padding: '10px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          您的浏览器不支持语音识别，请使用Chrome、Edge或Safari浏览器。
        </div>
      ) : (
        <>
          <button
            onClick={handleRecord}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: isRecording ? '#F56565' : '#4FD1C5',
              color: 'white',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {isRecording ? '停止' : '录音'}
          </button>
          
          <div style={{
            minHeight: '24px',
            color: 'white',
            padding: '8px 16px',
            backgroundColor: isRecording ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '300px',
            textAlign: 'center',
            transition: 'background-color 0.3s ease'
          }}>
            {isRecording ? '正在录音...' : (transcript || '点击录音按钮开始')}
          </div>
          
          {error && (
            <div style={{
              color: '#F56565',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '14px',
              width: '100%',
              maxWidth: '300px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

VoiceRecorder.propTypes = {
  onTranscript: PropTypes.func,
};

export default VoiceRecorder; 