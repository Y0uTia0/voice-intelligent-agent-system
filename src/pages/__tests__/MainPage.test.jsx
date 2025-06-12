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

// 模拟speakText函数
const mockSpeakText = jest.fn();

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

  // 新增测试：测试确认操作功能
  it('点击确认按钮应执行工具并显示结果', async () => {
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
    
    // 等待确认界面显示
    await waitFor(() => {
      expect(screen.getByText('您要执行此操作吗？')).toBeInTheDocument();
    });
    
    // 点击确认按钮
    const confirmButton = screen.getByText('确认');
    fireEvent.click(confirmButton);
    
    // 验证executeTool被调用
    await waitFor(() => {
      expect(apiClient.executeTool).toHaveBeenCalledWith({
        sessionId: 'session123',
        toolId: 'test-tool',
        params: { param1: 'value1' }
      });
    });
    
    // 验证结果显示
    expect(await screen.findByText('执行结果:')).toBeInTheDocument();
    expect(await screen.findByText('操作已成功执行')).toBeInTheDocument();
    
    // 验证语音合成被调用
    expect(global.speechSynthesis.speak).toHaveBeenCalled();
  });

  // 新增测试：测试取消操作功能
  it('点击取消按钮应清除确认界面', async () => {
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
    
    // 等待确认界面显示
    await waitFor(() => {
      expect(screen.getByText('您要执行此操作吗？')).toBeInTheDocument();
    });
    
    // 点击取消按钮
    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);
    
    // 验证确认界面被清除
    await waitFor(() => {
      expect(screen.queryByText('您要执行此操作吗？')).not.toBeInTheDocument();
    });
    
    // 验证executeTool未被调用
    expect(apiClient.executeTool).not.toHaveBeenCalled();
  });

  // 新增测试：测试语音识别错误处理
  it('应正确处理语音识别错误', async () => {
    render(<MainPage />);
    
    // 开始录音
    const recordButton = screen.getByText('录音');
    fireEvent.click(recordButton);
    
    // 模拟语音识别错误
    act(() => {
      mockSpeechRecognition.onerror({ error: 'no-speech' });
    });
    
    // 验证错误信息显示
    await waitFor(() => {
      expect(screen.getByText('语音识别错误: no-speech')).toBeInTheDocument();
    });
    
    // 验证录音状态被重置
    expect(screen.getByText('录音')).toBeInTheDocument();
  });

  // 新增测试：测试意图解析API错误处理
  it('应正确处理意图解析API错误', async () => {
    // 模拟API错误
    apiClient.interpret.mockRejectedValueOnce(new Error('API连接失败'));
    
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
    
    // 验证错误信息显示
    await waitFor(() => {
      expect(screen.getByText('意图解析失败: API连接失败')).toBeInTheDocument();
    });
  });

  // 新增测试：测试工具执行API错误处理
  it('应正确处理工具执行API错误', async () => {
    // 正常设置意图解析
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
    
    // 模拟工具执行错误
    apiClient.executeTool.mockRejectedValueOnce(new Error('执行失败'));
    
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
    
    // 等待确认界面显示
    await waitFor(() => {
      expect(screen.getByText('您要执行此操作吗？')).toBeInTheDocument();
    });
    
    // 点击确认按钮
    const confirmButton = screen.getByText('确认');
    fireEvent.click(confirmButton);
    
    // 验证错误信息显示
    await waitFor(() => {
      expect(screen.getByText('工具执行失败: 执行失败')).toBeInTheDocument();
    });
  });

  // 修改测试：测试再次播放功能
  it('点击再次播放按钮应再次播放语音', async () => {
    // 模拟SpeechSynthesisUtterance的onend回调
    const mockUtterance = {
      onend: null,
      onerror: null,
      lang: '',
      rate: 1.0,
      pitch: 1.0
    };
    
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => mockUtterance);
    
    render(<MainPage />);
    
    // 开始录音并完成整个流程
    const recordButton = screen.getByText('录音');
    fireEvent.click(recordButton);
    
    // 模拟语音识别结果
    act(() => {
      mockSpeechRecognition.onresult({
        resultIndex: 0,
        results: [[{ transcript: '打开灯', isFinal: true }]]
      });
    });
    
    // 停止录音
    const stopButton = screen.getByText('停止');
    fireEvent.click(stopButton);
    
    // 等待确认界面显示并点击确认
    await waitFor(() => {
      expect(screen.getByText('您要执行此操作吗？')).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByText('确认');
    fireEvent.click(confirmButton);
    
    // 等待结果显示
    await waitFor(() => {
      expect(screen.getByText('操作已成功执行')).toBeInTheDocument();
    });
    
    // 等待语音播报完成
    await waitFor(() => {
      // 模拟语音播报完成
      if (mockUtterance.onend) {
        act(() => {
          mockUtterance.onend();
        });
      }
      
      // 等待"正在语音播报..."消失
      const speakingElements = screen.queryByText('正在语音播报...');
      return speakingElements === null;
    }, { timeout: 3000 });
    
    // 检查再次播放按钮是否存在并且未禁用
    const replayButton = screen.getByText('再次播放');
    expect(replayButton).toBeInTheDocument();
    expect(replayButton).not.toBeDisabled();
    
    // 测试按钮可以点击
    fireEvent.click(replayButton);
    
    // 验证语音合成被调用
    expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('操作已成功执行');
  });
}); 