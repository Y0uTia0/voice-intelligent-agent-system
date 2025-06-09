import React from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import '../styles/ThemeToggle.css';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT);
  };
  
  return (
    <div className="theme-toggle">
      <button 
        onClick={toggleTheme}
        className="theme-toggle-btn"
        aria-label="切换主题模式"
      >
        {theme === THEMES.LIGHT ? '🌙' : '☀️'}
      </button>
    </div>
  );
}

export default ThemeToggle; 