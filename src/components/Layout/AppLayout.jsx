import React from 'react';
import PropTypes from 'prop-types';
import ThemeToggle from '../ThemeToggle.jsx';

const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <header className="w-full px-4 py-3 bg-[var(--bg-secondary)] shadow-md flex items-center justify-between">
        <span className="text-xl font-bold tracking-wide">语音智能代理系统</span>
        <ThemeToggle />
      </header>
      <main className="flex-1 w-full max-w-2xl mx-auto px-2 py-4">
        {children}
      </main>
      <footer className="w-full px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-muted)] text-center text-xs">
        &copy; {new Date().getFullYear()} 智能语音系统 All Rights Reserved.
      </footer>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node,
};

export default AppLayout; 