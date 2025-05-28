import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { SessionProvider } from './contexts/SessionContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import MainPage from './pages/MainPage'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SessionProvider>
            <Router>
              <MainPage />
            </Router>
          </SessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App 