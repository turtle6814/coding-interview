import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/Navigation';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import QuestionBankPage from './pages/QuestionBankPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewerSessionPage from './pages/InterviewerSessionPage';
import CandidateSessionPage from './pages/CandidateSessionPage';
import SessionReviewPage from './pages/SessionReviewPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/session/:id" 
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions" 
              element={
                <ProtectedRoute requiredRole="INTERVIEWER">
                  <QuestionBankPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/setup-interview" 
              element={
                <ProtectedRoute requiredRole="INTERVIEWER">
                  <InterviewSetupPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interview-session/:id" 
              element={
                <ProtectedRoute requiredRole="INTERVIEWER">
                  <InterviewerSessionPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate-session/:id" 
              element={
                <ProtectedRoute requiredRole="CANDIDATE">
                  <CandidateSessionPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/session-review/:id" 
              element={
                <ProtectedRoute>
                  <SessionReviewPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
