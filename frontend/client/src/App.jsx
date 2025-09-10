import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import SessionHistory from './components/SessionHistory';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { isLoggedIn } from './utils/auth';
import './App.css';

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/signin" replace />;
}

function App() {
  const [userPreferences, setUserPreferences] = useState({
    mood: '',
    gender: 'female',
    persona: 'calm',
    genz: false,
    journaling: false
  });

  return (
    <Router>
      <div className="App">
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
            path="/history" 
            element={
              <PrivateRoute>
                <SessionHistory />
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
