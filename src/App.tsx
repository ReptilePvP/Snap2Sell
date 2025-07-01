import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CameraPage from './pages/CameraPage'
import HistoryPage from './pages/HistoryPage'
import SavedPage from './pages/SavedPage'
import ProfilePage from './pages/ProfilePage'
import AnalysisSelectionPage from './pages/AnalysisSelectionPage'
import AnalyzeGeminiPage from './pages/analysis/AnalyzeGeminiPage'
import AnalyzeSerpAPIPage from './pages/analysis/AnalyzeSerpAPIPage'
import AnalyzeSearchAPIPage from './pages/analysis/AnalyzeSearchAPIPage'
// TODO: OpenLens temporarily disabled - working on improvements
// import AnalyzeOpenLensPage from './pages/analysis/AnalyzeOpenLensPage'
import SignInPage from './pages/auth/SignInPage'
import SignUpPage from './pages/auth/SignUpPage'
import WelcomePage from './pages/auth/WelcomePage'
import TroubleshootingPage from './pages/TroubleshootingPage'
import ImageEnhancementDemo from './pages/ImageEnhancementDemo'
import AuthLoading from './components/AuthLoading'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <AuthLoading />
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/troubleshooting" element={<TroubleshootingPage />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/analyze" element={<AnalysisSelectionPage />} />
        <Route path="/analyze/gemini" element={<AnalyzeGeminiPage />} />
        <Route path="/analyze/serpapi" element={<AnalyzeSerpAPIPage />} />
        <Route path="/analyze/searchapi" element={<AnalyzeSearchAPIPage />} />
        <Route path="/demo/enhancements" element={<ImageEnhancementDemo />} />
        {/* TODO: OpenLens temporarily disabled - working on improvements */}
        {/* <Route path="/analyze/openlens" element={<AnalyzeOpenLensPage />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App