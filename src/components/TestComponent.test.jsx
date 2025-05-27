import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TestComponent from './TestComponent';

describe('TestComponent', () => {
  it('renders with default props', () => {
    render(<TestComponent />);
    expect(screen.getByText('测试组件')).toBeInTheDocument();
    expect(screen.getByText('点击测试')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<TestComponent title="自定义标题" />);
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
  });

  it('calls onClick handler when button is clicked', () => {
    const handleClick = jest.fn();
    render(<TestComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('点击测试'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
}); 