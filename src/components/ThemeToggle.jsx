import React from 'react';
import { Switch } from 'antd-mobile';
import { useTheme } from '../contexts/ThemeContext.jsx';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === 'light';

  const toggleTheme = () => {
    setTheme(isLight ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center gap-2" aria-label="主题切换">
      <span role="img" aria-label="暗色">🌙</span>
      <Switch
        checked={isLight}
        onChange={toggleTheme}
        aria-label="切换主题"
      />
      <span role="img" aria-label="亮色">☀️</span>
    </div>
  );
}

export default ThemeToggle; 