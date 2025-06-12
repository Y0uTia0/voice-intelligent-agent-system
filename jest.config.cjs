/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { 
      configFile: './babel.config.cjs' 
    }]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!axios).+\\.js$'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx}',
    '!src/index.js',
    '!src/mocks/**/*.{js,jsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    }
  },
  // 模拟import.meta环境
  globals: {
    'import.meta': {
      env: {
        DEV: process.env.NODE_ENV === 'development',
        PROD: process.env.NODE_ENV === 'production',
        TEST: process.env.NODE_ENV === 'test',
        VITE_API_URL: 'http://localhost:5000/api',
        VITE_AUTH_DOMAIN: 'auth.example.com',
        VITE_AUTH_CLIENT_ID: 'client-id',
        VITE_AUTH_AUDIENCE: 'api-audience'
      }
    }
  },
  // 添加模拟设置，模拟import.meta
  setupFiles: ['<rootDir>/jest.env.setup.js']
}; 