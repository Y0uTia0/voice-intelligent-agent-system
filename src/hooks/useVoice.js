import { useState, useCallback } from 'react';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');

  // 开始录音
  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');
    try {
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        throw new Error('您的浏览器不支持语音识别功能');
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'zh-CN';
      recognitionInstance.onresult = (event) => {
        const result = event.results[0];
        const text = result[0].transcript;
        setTranscript(text);
      };
      recognitionInstance.onerror = (event) => {
        setError(`语音识别出错: ${event.error}`);
        setIsRecording(false);
      };
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      recognitionInstance.start();
      setRecognition(recognitionInstance);
      setIsRecording(true);
    } catch (err) {
      setError(`启动语音识别失败: ${err.message}`);
    }
  }, []);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
    return transcript;
  }, [recognition, transcript]);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording
  };
} 