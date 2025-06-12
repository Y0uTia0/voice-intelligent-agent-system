import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainPage from '../MainPage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import * as apiClient from '../../services/apiClient';

// 模拟依赖
jest.mock('../../context/AuthContext');
jest.mock('../../contexts/ThemeContext');
jest.mock('../../services/apiClient');

// 模拟SpeechRecognition API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: '',
  onresult: null,
  onerror: null,
  onend: null
};

describe('MainPage 组件', () => {
  // 在每个测试前设置模拟
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 模拟useAuth钩子
    useAuth.mockReturnValue({
      isAuthenticated: true
    });
    
    // 模拟useTheme钩子
    useTheme.mockReturnValue({
      theme: 'light'
    });
    
    // 模拟apiClient函数
    apiClient.getUserId.mockReturnValue('user123');
    apiClient.interpret.mockResolvedValue({
      confirmText: '您要执行此操作吗？',
      sessionId: 'session123',
      tool_calls: [
        { 
          tool_id: 'test-tool',
          parameters: { param1: 'value1' }
        }
      ]
    });
    apiClient.executeTool.mockResolvedValue({
      data: { tts_message: '操作已成功执行' }
    });
    
    // 模拟Web Speech API
    global.SpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
    global.webkitSpeechRecognition = jest.fn().mockImplementation(() => mockSpeechRecognition);
    
    // 模拟语音合成
    const mockUtterance = {
      onend: null,
      onerror: null
    };
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => mockUtterance);
    global.speechSynthesis = {
      speak: jest.fn(),
      cancel: jest.fn()
    };
  });

  it('应正确渲染标题和状态信息', () => {
    render(<MainPage />);
    
    expect(screen.getByText('智能语音助手')).toBeInTheDocument();
    expect(screen.getByText('用户状态:')).toBeInTheDocument();
    expect(screen.getByText('已登录')).toBeInTheDocument();
    expect(screen.getByText('用户ID:')).toBeInTheDocument();
    expect(screen.getByText('user123')).toBeInTheDocument();
    expect(screen.getByText('当前主题:')).toBeInTheDocument();
    expect(screen.getByText('亮色')).toBeInTheDocument();
  });
  
  it('应显示录音按钮并处于未录音状态', () => {
    render(<MainPage />);
    
    const recordButton = screen.getByText('录音');
    expect(recordButton).toBeInTheDocument();
    expect(recordButton).not.toHaveClass('active');
  });
  
  it('点击录音按钮应开始录音并更新UI状态', async () => {
    render(<MainPage />);
    
    const recordButton = screen.getByText('录音');
    fireEvent.click(recordButton);
    
    // 验证按钮状态改变
    await waitFor(() => {
      expect(screen.getByText('停止')).toBeInTheDocument();
    });
    
    // 验证SpeechRecognition API被调用
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });
  
  it('当未登录时点击录音按钮应显示错误信息', () => {
    // 模拟未登录状态
    useAuth.mockReturnValue({
      isAuthenticated: false
    });
    
    render(<MainPage />);
    
    const recordButton = screen.getByText('录音');
    fireEvent.click(recordButton);
    
    // 验证错误信息显示
    expect(screen.getByText('请先登录')).toBeInTheDocument();
    
    // 验证SpeechRecognition API未被调用
    expect(mockSpeechRecognition.start).not.toHaveBeenCalled();
  });
  
  it('当语音识别完成后应显示确认操作界面', async () => {
    render(<MainPage />);
    
    // 开始录音
    const recordButton = screen.getByText('录音');
    fireEvent.click(recordButton);
    
    // 模拟语音识别结果
    const mockResults = [
      [{ transcript: '打开灯', isFinal: true }]
    ];
    const mockEvent = {
      resultIndex: 0,
      results: mockResults
    };
    
    // 触发语音识别结果事件
    act(() => {
      mockSpeechRecognition.onresult(mockEvent);
    });
    
    // 停止录音
    const stopButton = screen.getByText('停止');
    fireEvent.click(stopButton);
    
    // 等待API调用和状态更新
    await waitFor(() => {
      expect(apiClient.interpret).toHaveBeenCalledWith('打开灯', undefined);
      expect(screen.getByText('您要执行此操作吗？')).toBeInTheDocument();
    });
    
    // 验证确认和取消按钮存在
    expect(screen.getByText('确认')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });
}); 