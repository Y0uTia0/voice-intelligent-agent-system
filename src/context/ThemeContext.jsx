import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建主题上下文
export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

// 主题提供组件
export const ThemeProvider = ({ children }) => {
  // 从本地存储中获取主题设置，默认为暗色
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  // 切换主题函数
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 更新文档根元素的数据属性，用于CSS选择器
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // 初始化时设置文档主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 提供上下文值
  const contextValue = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 便捷的Hook，用于获取主题上下文
export const useTheme = () => useContext(ThemeContext); 