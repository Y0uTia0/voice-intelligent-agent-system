import React, { useState } from 'react';
import { Form, Slider, Button, Radio } from 'antd-mobile';
import { useTheme } from '../contexts/ThemeContext.jsx';

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState(() => getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#4FD1C5');
  const [borderRadius, setBorderRadius] = useState(() => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--radius-base')) || 8);

  // 更新主题颜色
  const handleColorChange = (color) => {
    setPrimaryColor(color);
    document.documentElement.style.setProperty('--color-primary', color);
  };

  // 更新圆角大小
  const handleRadiusChange = (radius) => {
    setBorderRadius(radius);
    document.documentElement.style.setProperty('--radius-base', `${radius}px`);
  };

  // 重置为默认设置
  const handleReset = () => {
    setPrimaryColor('#4FD1C5');
    document.documentElement.style.setProperty('--color-primary', '#4FD1C5');
    setBorderRadius(8);
    document.documentElement.style.setProperty('--radius-base', '8px');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-[var(--bg-secondary)] rounded shadow-md mt-6">
      <h2 className="text-lg font-bold mb-4">主题设置</h2>
      <Form layout="vertical">
        <Form.Item label="主题模式">
          <Radio.Group
            value={theme}
            onChange={setTheme}
            aria-label="主题模式选择"
          >
            <Radio value={THEMES.LIGHT}>浅色</Radio>
            <Radio value={THEMES.DARK}>深色</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="主色调">
          <input
            type="color"
            value={primaryColor}
            onChange={e => handleColorChange(e.target.value)}
            aria-label="主色调选择"
            className="w-10 h-10 border-none bg-transparent cursor-pointer"
          />
        </Form.Item>
        <Form.Item label={`圆角大小: ${borderRadius}px`}>
          <Slider
            min={0}
            max={24}
            step={1}
            value={borderRadius}
            onChange={handleRadiusChange}
            aria-label="圆角大小调整"
          />
        </Form.Item>
        <Form.Item>
          <Button block onClick={handleReset} aria-label="重置为默认设置">
            重置为默认设置
          </Button>
        </Form.Item>
      </Form>
      <div className="mt-6">
        <h3 className="font-semibold mb-2">预览</h3>
        <button
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-base)',
            padding: '8px 16px',
            border: 'none',
            color: 'white',
            transition: 'all var(--transition-normal) var(--transition-ease)',
          }}
        >
          按钮样式预览
        </button>
      </div>
    </div>
  );
}

export default ThemeSettings; 