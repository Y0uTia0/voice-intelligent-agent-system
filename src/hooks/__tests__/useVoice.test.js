import { renderHook, act } from '@testing-library/react-hooks';
import { useVoice } from '../useVoice';

describe('useVoice hook', () => {
  beforeAll(() => {
    // 模拟 navigator.mediaDevices
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockImplementation(() => Promise.resolve('mockStream'))
    };
    
    // 模拟 SpeechRecognition
    global.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start: jest.fn().mockImplementation(() => {
        // 立即触发 onresult 事件模拟录音
        setTimeout(() => {
          const instance = global.SpeechRecognition.mock.instances[0];
          if (instance.onresult) {
            instance.onresult({
              results: [
                [{ transcript: '测试录音文本' }]
              ]
            });
          }
        }, 10);
      }),
      stop: jest.fn(),
      continuous: false,
      interimResults: true,
      lang: '',
      onresult: null,
      onerror: null,
      onend: null,
    }));
    global.webkitSpeechRecognition = global.SpeechRecognition;
    
    // 设置测试环境标识
    process.env.NODE_ENV = 'test';
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.isRecording).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.error).toBeNull();
    expect(typeof result.current.startRecording).toBe('function');
    expect(typeof result.current.stopRecording).toBe('function');
  });

  it('should start recording when startRecording is called', async () => {
    const { result } = renderHook(() => useVoice());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.isRecording).toBe(true);
  });

  it('should stop recording when stopRecording is called', async () => {
    const { result } = renderHook(() => useVoice());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.isRecording).toBe(true);
    act(() => {
      result.current.stopRecording();
    });
    expect(result.current.isRecording).toBe(false);
  });
}); 