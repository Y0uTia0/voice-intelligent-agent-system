module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    ['@babel/preset-react', {runtime: 'automatic'}]
  ],
  plugins: [
    // 添加babel插件以支持import.meta
    function () {
      return {
        visitor: {
          MetaProperty(path) {
            // 将import.meta转换为process.env或全局对象
            if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
              path.replaceWithSourceString('globalThis.import_meta');
            }
          }
        }
      };
    }
  ]
}; 