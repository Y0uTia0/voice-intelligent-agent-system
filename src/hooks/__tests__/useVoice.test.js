import { renderHook, act } from '@testing-library/react-hooks';
import { useVoice } from '../useVoice';

// 保存原始环境变量
const originalEnv = process.env.NODE_ENV;

describe('useVoice hook', () => {
  beforeAll(() => {
    // 设置测试环境标识
    process.env.NODE_ENV = 'test';
    
    // 确保在全局对象上添加必要的属性
    if (!global.navigator) {
      global.navigator = {};
    }
    
    // 模拟 navigator.mediaDevices
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockImplementation(() => Promise.resolve('mockStream'))
    };
    
    // 创建更完整的 SpeechRecognition 模拟
    const MockSpeechRecognition = function() {
      this.continuous = false;
      this.interimResults = true;
      this.lang = '';
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
      
      this.start = jest.fn().mockImplementation(() => {
        // 当调用 start 时自动设置成功状态并触发结果
        setTimeout(() => {
          if (this.onresult) {
            this.onresult({
              results: [
                [{ transcript: '测试录音文本' }]
              ]
            });
          }
        }, 10);
      });
      
      this.stop = jest.fn().mockImplementation(() => {
        if (this.onend) {
          this.onend();
        }
      });
    };
    
    global.SpeechRecognition = jest.fn().mockImplementation(() => new MockSpeechRecognition());
    global.webkitSpeechRecognition = global.SpeechRecognition;
    
    // 确保在测试环境中 window 对象存在
    if (!global.window) {
      global.window = {};
    }
    
    global.window.SpeechRecognition = global.SpeechRecognition;
    global.window.webkitSpeechRecognition = global.SpeechRecognition;
  });
  
  afterAll(() => {
    // 恢复原始环境变量
    process.env.NODE_ENV = originalEnv;
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