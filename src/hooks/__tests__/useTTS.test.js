import { renderHook, act } from '@testing-library/react-hooks';
import { useTTS } from '../useTTS';

describe('useTTS hook', () => {
  // 保存原始的 speechSynthesis
  let originalSpeechSynthesis;
  
  beforeAll(() => {
    // 保存可能存在的原始实现
    originalSpeechSynthesis = window.speechSynthesis;
    
    // 创建 SpeechSynthesisUtterance 模拟
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
      text,
      lang: '',
      rate: 1,
      pitch: 1,
      volume: 1,
      onstart: null,
      onend: null,
      onerror: null
    }));
    
    // 创建 speechSynthesis 模拟
    window.speechSynthesis = {
      speak: jest.fn().mockImplementation((utterance) => {
        // 模拟触发 onstart 和 onend 事件
        if (utterance.onstart) setTimeout(() => utterance.onstart(), 10);
        if (utterance.onend) setTimeout(() => utterance.onend(), 50);
      }),
      cancel: jest.fn()
    };
  });
  
  afterAll(() => {
    // 恢复原始实现
    window.speechSynthesis = originalSpeechSynthesis;
  });
  
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTTS());
    
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.speak).toBe('function');
    expect(typeof result.current.stop).toBe('function');
  });
  
  it('should set isSpeaking to true when speak is called', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTTS());
    
    act(() => {
      result.current.speak('测试文本');
    });
    
    await waitForNextUpdate();
    
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(true);
    
    // 等待 onend 触发
    await waitForNextUpdate();
    
    expect(result.current.isSpeaking).toBe(false);
  });
  
  it('should call cancel when stop is called', () => {
    const { result } = renderHook(() => useTTS());
    
    act(() => {
      result.current.stop();
    });
    
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });
  
  it('should handle errors when speechSynthesis is not available', () => {
    // 临时移除 speechSynthesis
    const tempSpeechSynthesis = window.speechSynthesis;
    window.speechSynthesis = undefined;
    
    const { result } = renderHook(() => useTTS());
    
    act(() => {
      result.current.speak('测试文本');
    });
    
    expect(result.current.error).not.toBeNull();
    expect(result.current.error).toContain('您的浏览器不支持语音合成功能');
    
    // 恢复 speechSynthesis
    window.speechSynthesis = tempSpeechSynthesis;
  });
  
  it('should handle speech error events', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTTS());
    
    // 修改 speak 实现以触发错误
    window.speechSynthesis.speak.mockImplementationOnce((utterance) => {
      if (utterance.onerror) {
        setTimeout(() => utterance.onerror({ error: '模拟错误' }), 10);
      }
    });
    
    act(() => {
      result.current.speak('测试文本');
    });
    
    await waitForNextUpdate();
    
    expect(result.current.error).not.toBeNull();
    expect(result.current.error).toContain('语音合成出错: 模拟错误');
    expect(result.current.isSpeaking).toBe(false);
  });
}); 