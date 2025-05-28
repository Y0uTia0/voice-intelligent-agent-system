import { useState, useCallback } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);

  const speak = useCallback((text) => {
    setError(null);
    try {
      if (!window.speechSynthesis) {
        throw new Error('您的浏览器不支持语音合成功能');
      }
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        setError(`语音合成出错: ${event.error}`);
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setError(`启动语音合成失败: ${err.message}`);
    }
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    error
  };
} 