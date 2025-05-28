import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceRecorder from './VoiceRecorder';
import * as useVoiceModule from '../hooks/useVoice';

jest.mock('../hooks/useVoice', () => ({
  __esModule: true,
  useVoice: jest.fn(),
}));

describe('VoiceRecorder component', () => {
  beforeEach(() => {
    useVoiceModule.useVoice.mockReturnValue({
      isRecording: false,
      transcript: '',
      error: null,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    });
  });

  it('should render the recorder button', () => {
    render(<VoiceRecorder />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName('开始录音');
  });

  it('should start recording when button is clicked', () => {
    const startRecording = jest.fn();
    useVoiceModule.useVoice.mockReturnValue({
      isRecording: false,
      transcript: '',
      error: null,
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
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    });
    render(<VoiceRecorder />);
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('停止录音');
  });
}); 