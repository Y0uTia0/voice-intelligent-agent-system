import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd-mobile';

/**
 * 测试组件
 * @param {Object} props
 * @param {string} props.title - 标题文本
 * @param {Function} props.onClick - 点击按钮时的回调函数
 */
const TestComponent = memo(({ title = '测试组件', onClick }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <Button color="primary" onClick={onClick}>
        点击测试
      </Button>
    </div>
  );
});

TestComponent.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func,
};

TestComponent.defaultProps = {
  title: '测试组件',
  onClick: () => {},
};

// 设置组件显示名称
TestComponent.displayName = 'TestComponent';

export default TestComponent; 