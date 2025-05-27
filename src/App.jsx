import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import TestComponent from './components/TestComponent'

function App() {
  const handleClick = () => {
    console.log('按钮被点击')
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-center py-8">
              欢迎使用前端项目
            </h1>
            <TestComponent title="测试组件示例" onClick={handleClick} />
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App 