import React, { createContext, useState, useEffect, useContext } from 'react';

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

const ThemeContext = createContext({
  theme: THEMES.DARK,
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  // 从localStorage读取保存的主题，默认为深色
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    // 检查系统深色模式偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? THEMES.DARK : THEMES.LIGHT;
  });

  // 更新主题时保存到localStorage并设置data-theme
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 监听系统主题变化（仅在未手动设置时生效）
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { THEMES }; 