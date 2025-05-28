import { renderHook, act } from '@testing-library/react-hooks';
import { useVoice } from '../useVoice';

describe('useVoice hook', () => {
  beforeAll(() => {
    // 模拟 SpeechRecognition
    global.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      continuous: false,
      interimResults: true,
      lang: '',
      onresult: null,
      onerror: null,
      onend: null,
    }));
    global.webkitSpeechRecognition = global.SpeechRecognition;
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