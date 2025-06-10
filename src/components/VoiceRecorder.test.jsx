import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceRecorder from './VoiceRecorder';
import * as useVoiceModule from '../hooks/useVoice';

// 完全模拟 useVoice hook
jest.mock('../hooks/useVoice', () => ({
  __esModule: true,
  useVoice: jest.fn(),
}));

describe('VoiceRecorder component', () => {
  // 在每个测试前重置模拟
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 默认返回支持语音识别的状态
    useVoiceModule.useVoice.mockReturnValue({
      isRecording: false,
      transcript: '',
      error: null,
      isSupported: true, // 确保默认为 true
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    });
  });

  it('should render the recorder button', () => {
    render(<VoiceRecorder />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('录音');
  });

  it('should start recording when button is clicked', () => {
    const startRecording = jest.fn();
    useVoiceModule.useVoice.mockReturnValue({
      isRecording: false,
      transcript: '',
      error: null,
      isSupported: true,
      startRecording,
      stopRecording: jest.fn(),
    });
    render(<VoiceRecorder />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(startRecording).toHaveBeenCalled();
  });

  it('should show recording state when isRecording is true', () => {
    useVoiceModule.useVoice.mockReturnValue({
      isRecording: true,
      transcript: '',
      error: null,
      isSupported: true,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    });
    render(<VoiceRecorder />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('停止');
  });
  
  it('should show error message when browser is not supported', () => {
    // 测试不支持的情况
    useVoiceModule.useVoice.mockReturnValue({
      isRecording: false,
      transcript: '',
      error: null,
      isSupported: false, // 模拟不支持
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    });
    render(<VoiceRecorder />);
    const errorMessage = screen.getByText('您的浏览器不支持语音识别，请使用Chrome、Edge或Safari浏览器。');
    expect(errorMessage).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
}); 