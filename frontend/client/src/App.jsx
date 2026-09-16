import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import SessionHistory from './components/SessionHistory';
import MoodDashboard from './components/MoodDashboard';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import OnboardingModal from './components/OnboardingModal';
import BreathingExercise from './components/BreathingExercise';
import CBTWorksheet from './components/CBTWorksheet';
import ProfileSettings from './components/ProfileSettings';
import { isLoggedIn } from './utils/auth';
import './App.css';

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/signin" replace />;
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showCBT, setShowCBT] = useState(false);

  const [userPreferences, setUserPreferences] = useState({
    gender: 'female',
    persona: 'calm',
    genz: false,
    journaling: false
  });

  useEffect(() => {
    const hasCompleted = localStorage.getItem('mindful_onboarding_completed');
    if (!hasCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (preferences) => {
    localStorage.setItem('mindful_onboarding_completed', 'true');
    setUserPreferences((prev) => ({ ...prev, ...preferences }));
  };

  return (
    <Router>
      <div className="App">
        {/* Onboarding Wizard */}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />

        {/* Global Standalone Tool Modals */}
        <BreathingExercise
          isOpen={showBreathing}
          onClose={() => setShowBreathing(false)}
        />
        <CBTWorksheet
          isOpen={showCBT}
          onClose={() => setShowCBT(false)}
        />

        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                userPreferences={userPreferences}
                setUserPreferences={setUserPreferences}
              />
            } 
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/sign-in" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <ChatInterface userPreferences={userPreferences} />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <MoodDashboard 
                  onOpenBreathing={() => setShowBreathing(true)}
                  onOpenCBT={() => setShowCBT(true)}
                />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <PrivateRoute>
                <SessionHistory />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfileSettings />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
