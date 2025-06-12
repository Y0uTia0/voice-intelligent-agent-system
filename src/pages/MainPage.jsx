import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { interpret, executeTool, getUserId } from '../services/apiClient';
import '../styles/MainPage.css';
import ThemeToggle from '../components/ThemeToggle';
import { Link } from 'react-router-dom';

// 创建语音识别实例
const createSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'zh-CN';
  
  return recognition;
};

// 语音合成功能
const speakText = (text) => {
  if (!text || typeof window === 'undefined') return;
  
  const speechSynthesis = window.speechSynthesis;
  if (!speechSynthesis) return;
  
  // 取消所有正在播放的语音
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.0; // 语速
  utterance.pitch = 1.0; // 音高
  
  speechSynthesis.speak(utterance);
  return utterance;
};

const MainPage = () => {
  // 使用认证和主题上下文
  const { isAuthenticated, role } = useAuth();
  const { theme } = useTheme();
  
  // 语音识别状态
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [result, setResult] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // 保存当前会话信息
  const [currentSession, setCurrentSession] = useState(null);
  
  // 计算当前主题的显示文本
  const themeText = theme === 'light' ? '亮色' : '暗色';
  
  // 监听主题变化的调试代码
  useEffect(() => {
    console.log('MainPage: 主题变化了 ->', theme);
    console.log('MainPage: 显示文字 ->', themeText);
  }, [theme, themeText]);
  
  // 添加调试日志
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] [${type}] ${message}`);
  };
  
  // 初始化语音识别
  useEffect(() => {
    const speechRecognition = createSpeechRecognition();
    setRecognition(speechRecognition);
    
    const userId = getUserId();
    const speechSupported = !!speechRecognition;
    
    addLog(`页面加载完成. 认证状态: ${isAuthenticated ? '已登录' : '未登录'}, 用户ID: ${userId || '未知'}`, 'system');
    addLog(`Web Speech API支持: ${speechSupported ? '支持' : '不支持'}`, 'system');
    addLog(`当前主题: ${theme}`, 'system');
    
    // 清除状态
    setTranscript('');
    setConfirmMessage('');
    setResult('');
    setError(null);
    
    if (!speechSupported) {
      setError('您的浏览器不支持语音识别功能');
      addLog('浏览器不支持Web Speech API', 'error');
    }
    
    return () => {
      if (speechRecognition && isListening) {
        try {
          speechRecognition.stop();
        } catch (err) {
          console.error('清理时停止语音识别失败:', err);
        }
      }
    };
  }, [isAuthenticated, theme]);
  
  // 开始录音
  const startListening = () => {
    if (!isAuthenticated) {
      addLog('用户未登录，请先登录', 'error');
      setError('请先登录');
      return;
    }
    
    if (!recognition) {
      addLog('浏览器不支持语音识别', 'error');
      setError('您的浏览器不支持语音识别功能');
      return;
    }
    
    try {
      setTranscript('');
      setError(null);
      setConfirmMessage('');
      setResult('');
      
      // 设置事件处理程序
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event) => {
        addLog(`语音识别错误: ${event.error}`, 'error');
        setError(`语音识别错误: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        if (isListening) {
          // 如果是正常停止，应该已经设置isListening为false
          // 如果不是，说明是意外停止
          addLog('语音识别意外停止，尝试重新启动', 'warning');
          try {
            recognition.start();
          } catch (err) {
            addLog(`重新启动语音识别失败: ${err.message}`, 'error');
            setIsListening(false);
          }
        }
      };
      
      // 开始识别
      recognition.start();
      setIsListening(true);
      addLog('开始录音...', 'system');
    } catch (err) {
      addLog(`启动语音识别失败: ${err.message}`, 'error');
      setError(`启动语音识别失败: ${err.message}`);
    }
  };
  
  // 停止录音
  const stopListening = async () => {
    if (!isListening || !recognition) return;
    
    try {
      // 首先把状态设为false，避免onend触发时再次启动
      setIsListening(false);
      recognition.stop();
      
      addLog(`录音结束，文本: "${transcript}"`, 'system');
      
      if (transcript && transcript.trim() !== '') {
        handleTranscript(transcript);
      } else {
        addLog('未检测到语音输入', 'warning');
        setError('未检测到语音输入');
      }
    } catch (err) {
      addLog(`停止语音识别失败: ${err.message}`, 'error');
      setError(`停止语音识别失败: ${err.message}`);
      setIsListening(false);
    }
  };
  
  // 处理语音文本
  const handleTranscript = async (text) => {
    if (!text || text.trim() === '') {
      addLog('文本为空，不处理', 'warning');
      return;
    }
    
    try {
      setProcessing(true);
      addLog(`处理文本: "${text}"`, 'system');
      
      // 调用意图解析API - 使用修改后的interpret函数
      addLog('调用意图解析API...', 'api');
      
      const response = await interpret(text, currentSession?.sessionId);
      addLog(`意图解析成功: ${JSON.stringify(response)}`, 'success');
      
      // 显示确认信息
      setConfirmMessage(response.confirmText || '是否执行该操作？');
      
      // 保存当前会话和工具信息，用于后续执行
      setCurrentSession({
        sessionId: response.sessionId,
        toolCalls: response.tool_calls
      });
      
    } catch (err) {
      console.error('意图解析错误:', err);
      addLog(`意图解析错误: ${err.message}`, 'error');
      setError(`意图解析失败: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };
  
  // 确认执行操作
  const handleConfirm = async () => {
    try {
      if (!currentSession) {
        addLog('没有可执行的会话', 'error');
        return;
      }
      
      setProcessing(true);
      const { sessionId, toolCalls } = currentSession;
      
      if (!toolCalls || toolCalls.length === 0) {
        addLog('没有可执行的工具调用', 'error');
        setError('没有可执行的工具调用');
        return;
      }
      
      const toolCall = toolCalls[0]; // 目前只处理第一个工具调用
      
      addLog(`执行工具: ${toolCall.tool_id}, 参数: ${JSON.stringify(toolCall.parameters)}`, 'api');
      
      // 使用修改后的executeTool函数
      const response = await executeTool({
        sessionId,
        toolId: toolCall.tool_id,
        params: toolCall.parameters
      });
      
      addLog(`工具执行成功: ${JSON.stringify(response)}`, 'success');
      const resultText = response.data?.tts_message || '操作已执行';
      setResult(resultText);
      setConfirmMessage('');
      
      // 语音播报结果
      setIsSpeaking(true);
      addLog(`开始语音播报: "${resultText}"`, 'system');
      
      const utterance = speakText(resultText);
      if (utterance) {
        utterance.onend = () => {
          setIsSpeaking(false);
          addLog('语音播报结束', 'system');
        };
        utterance.onerror = (event) => {
          setIsSpeaking(false);
          addLog(`语音播报错误: ${event.error}`, 'error');
        };
      } else {
        setIsSpeaking(false);
        addLog('浏览器不支持语音合成或合成失败', 'warning');
      }
      
    } catch (err) {
      console.error('工具执行错误:', err);
      addLog(`工具执行错误: ${err.message}`, 'error');
      setError(`工具执行失败: ${err.message}`);
      setIsSpeaking(false);
    } finally {
      setProcessing(false);
    }
  };
  
  // 取消操作
  const handleCancel = () => {
    setConfirmMessage('');
    setCurrentSession(null);
    addLog('用户取消了操作', 'info');
  };
  
  // 获取用户ID
  const userId = getUserId();
  
  // 渲染组件
  return (
    <div className="main-container">
      <div className="header-container">
        <h1>智能语音助手</h1>
        <div className="header-controls">
          <ThemeToggle />
          
          {/* 导航菜单 */}
          <nav className="main-nav">
            {(role === 'developer' || role === 'admin') && (
              <Link to="/developer" className="nav-link">
                开发者控制台
              </Link>
            )}
          </nav>
        </div>
      </div>
      
      <div className="status-info">
        <div>用户状态: <span className="highlight">{isAuthenticated ? '已登录' : '未登录'}</span></div>
        <div>用户ID: <span className="highlight">{userId || '未知'}</span></div>
        <div>Web Speech API: <span className="highlight">{!!recognition ? '支持' : '不支持'}</span></div>
        <div>当前主题: <span className="highlight">{themeText}</span></div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="voice-container">
        <button 
          className={`record-btn ${isListening ? 'active' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={processing || !recognition}
        >
          {isListening ? '停止' : '录音'}
        </button>
        
        {processing && <div className="processing">正在处理...</div>}
        {isSpeaking && <div className="speaking">正在语音播报...</div>}
        
        {transcript && (
          <div className="transcript-container">
            <h3>语音内容:</h3>
            <p className="transcript-text">{transcript}</p>
          </div>
        )}
        
        {confirmMessage && (
          <div className="confirm-container">
            <h3>确认操作:</h3>
            <p className="confirm-text">{confirmMessage}</p>
            <div className="confirm-buttons">
              <button onClick={handleConfirm} disabled={processing}>确认</button>
              <button onClick={handleCancel} disabled={processing}>取消</button>
            </div>
          </div>
        )}
        
        {result && (
          <div className="result-container">
            <h3>执行结果:</h3>
            <p className="result-text">{result}</p>
            <button 
              onClick={() => speakText(result)} 
              className="speak-btn"
              disabled={isSpeaking}
            >
              再次播放
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage; 