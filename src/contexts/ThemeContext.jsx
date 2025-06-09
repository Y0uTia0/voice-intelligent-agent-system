import React, { createContext, useState, useEffect, useContext } from 'react';

// 主题选项
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// 创建上下文
const ThemeContext = createContext({
  theme: THEMES.DARK,
  setTheme: () => {},
});

// 主题提供者组件
export function ThemeProvider({ children }) {
  // 从localStorage读取保存的主题，默认为深色
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || THEMES.DARK;
  });
  
  // 更新主题时保存到localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    // 更新HTML元素的data-theme属性
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // 检查系统深色模式偏好
  useEffect(() => {
    // 如果没有保存的主题设置，使用系统偏好
    if (!localStorage.getItem('theme')) {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDarkMode ? THEMES.DARK : THEMES.LIGHT);
    }
    
    // 监听系统偏好变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义Hook，便于组件使用主题
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { THEMES }; 