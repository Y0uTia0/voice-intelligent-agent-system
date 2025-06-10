# 语音智能代理系统前端项目

## 项目简介

本项目是一个以语音为主要交互方式的端到端智能代理系统前端，支持语音录制、意图解析、复述确认、工具执行、结果展示等完整智能交互流程。项目高度模块化，支持自动化测试、主题切换、无障碍、响应式设计，适配多端设备。

## 目录结构

```
├── src/
│   ├── components/      # 复用UI组件（如VoiceRecorder、VoiceConfirmation、ThemeSettings等）
│   ├── hooks/           # 业务相关自定义hooks（如useVoice、useTTS等）
│   ├── contexts/        # 全局状态管理（Session、Auth、Theme等）
│   ├── services/        # API请求与后端对接（apiClient.js）
│   ├── pages/           # 页面组件（MainPage、ThemePage等）
│   ├── utils/           # 工具函数
│   ├── styles/          # 全局样式与主题
│   ├── tests/           # 预留集成测试目录
│   ├── mocks/           # 预留mock数据
│   └── main.jsx         # 应用入口
├── public/              # 静态资源
├── __mocks__/           # Jest静态资源mock
├── package.json         # 依赖与脚本
├── jest.config.cjs      # Jest测试配置
├── cypress.config.js    # E2E测试配置
├── eslint.config.js     # 代码规范配置（ESLint 9+）
├── tailwind.config.js   # TailwindCSS配置
├── vite.config.js       # Vite构建配置
└── docs/               # 项目文档
    ├── 1.前端技术规范文档.md
    ├── 2.API接口对接文档.md
    ├── 3.UI_UX设计规范.md
    ├── 4.核心业务流程文档.md
    ├── 5.测试要求与验收标准.md
    └── 6.开发环境搭建指南.md
```

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   # 如遇依赖冲突，使用：
   npm install --legacy-peer-deps
   ```

2. **本地开发启动**
   ```bash
   npm run dev
   # 默认端口 http://localhost:3000
   ```

3. **运行单元测试**
   ```bash
   npm test
   # 生成覆盖率报告
   npm test -- --coverage
   ```

4. **运行E2E测试**
   ```bash
   npm run cy:open
   # 或
   npm run cy:run
   ```

5. **代码风格检查**
   ```bash
   npm run lint
   ```

## 核心功能

- **语音录制与识别**：`VoiceRecorder` 组件+`useVoice` hook，支持Web Speech API，自动管理录音、转写、错误处理
- **意图解析与确认**：`VoiceConfirmation` 组件，自动复述、等待用户语音确认/取消/重试，支持TTS播报
- **工具执行与结果展示**：API对接后端，执行工具，结果卡片展示，支持语音播报与重新开始
- **全局状态管理**：`SessionContext`、`AuthContext`、`ThemeContext`，支持多阶段流转、会话管理、主题切换
- **主题与无障碍**：支持浅色/深色主题切换，键盘导航、aria属性、屏幕阅读器兼容
- **自动化测试**：Jest+Testing Library+jest-axe，Cypress端到端测试，覆盖率达标

## 开发指南

1. **初次接触项目**：
   - 首先阅读 [前端技术规范文档](./docs/1.前端技术规范文档.md) 了解项目技术栈和架构
   - 参照 [开发环境搭建指南](./docs/6.开发环境搭建指南.md) 配置开发环境
   - 查看 [核心业务流程文档](./docs/4.核心业务流程文档.md) 理解系统功能和交互方式

2. **开发过程中**：
   - 遵循 [UI/UX设计规范](./docs/3.UI_UX设计规范.md) 进行页面和组件开发
   - 根据 [API接口对接文档](./docs/2.API接口对接文档.md) 实现与后端的数据交互
   - 按照 [测试要求与验收标准](./docs/5.测试要求与验收标准.md) 编写测试代码

## 常见问题

- **依赖冲突**：使用 `npm install --legacy-peer-deps`
- **Jest CSS mock 报错**：确保已安装 `identity-obj-proxy` 并配置正确
- **自定义主题**：可在 `ThemeSettings` 页面调整主色调、圆角等
- **扩展API**：在 `src/services/apiClient.js` 统一封装

## 最近更新

- **修复测试中的JavaScript堆内存溢出问题**：优化了测试配置，增加了Node内存限制，解决了VoiceConfirmation组件测试导致的内存溢出问题
- **修正主题切换文字不更新问题**：修复了当切换主题时，"当前主题"文本显示不同步的问题，纠正了错误的导入路径

## 重要提示

- 所有代码必须通过测试要求才能提交验收
- 在开发过程中遇到的任何问题，请及时与项目联系人沟通
- 项目使用的是以语音为主要交互方式的端到端智能代理系统，请特别关注语音交互相关实现
- 请严格遵循文档中的规范和标准，这将是最终验收的重要依据

---

最后更新日期：2025年6月10日 