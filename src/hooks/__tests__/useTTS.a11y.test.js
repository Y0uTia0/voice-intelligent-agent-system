import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useTTS } from '../useTTS';

// 添加自定义 matchers
expect.extend(toHaveNoViolations);

// 创建一个测试组件，包含TTS功能和状态展示
const TestComponent = () => {
  const { speak, stop, isSpeaking, error } = useTTS();
  
  return (
    <div>
      <h1>TTS测试组件</h1>
      <button 
        onClick={() => speak('测试文本')}
        aria-label="播放语音"
      >
        播放
      </button>
      <button 
        onClick={stop}
        aria-label="停止语音"
        disabled={!isSpeaking}
      >
        停止
      </button>
      {isSpeaking && (
        <div aria-live="polite" role="status">
          正在播放语音...
        </div>
      )}
      {error && (
        <div aria-live="assertive" role="alert">
          出错了: {error.message}
        </div>
      )}
    </div>
  );
};

describe('useTTS hook a11y', () => {
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
      speak: jest.fn(),
      cancel: jest.fn(),
      paused: false,
      speaking: false,
      pending: false,
    };
  });
  
  afterAll(() => {
    // 恢复原始实现
    window.speechSynthesis = originalSpeechSynthesis;
  });
  
  it('should not have accessibility violations', async () => {
    const { container } = render(<TestComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 