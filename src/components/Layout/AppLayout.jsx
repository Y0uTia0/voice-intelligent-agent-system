import React from 'react';
import PropTypes from 'prop-types';

const AppLayout = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#1E1E2F',
    }}>
      <header style={{
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#27293D',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          color: 'white'
        }}>语音智能代理系统</span>
      </header>
      
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '8px'
      }}>
        {children}
      </main>
      
      <footer style={{
        width: '100%',
        padding: '8px 16px',
        backgroundColor: '#27293D',
        color: '#718096',
        textAlign: 'center',
        fontSize: '12px'
      }}>
        &copy; {new Date().getFullYear()} 智能语音系统 All Rights Reserved.
      </footer>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node,
};

export default AppLayout; 