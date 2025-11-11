import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import PracticeScreen from './components/PracticeScreen';
import Dashboard from './components/Dashboard';
import SessionSummary from './components/SessionSummary';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import PrivacyPolicy from './components/PrivacyPolicy'; // Import PrivacyPolicy
import { Routes, Route, Navigate, Link } from 'react-router-dom'; // Import Link
import './App.css';

import Onboarding from './components/Onboarding';

function App() {
  const { currentUser, isNewUser } = useAuth();

  return (
    <>
      <Routes>
        {/* Publicly Accessible Routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login />} />

        {/* Authenticated Routes */}
        <Route
          path="/*"
          element={
            currentUser ? (
              <>
                <Navbar />
                <div className="app-container">
                  <Routes>
                    {isNewUser ? (
                      <>
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/practice" element={<PracticeScreen />} />
                        <Route path="*" element={<Navigate to="/onboarding" />} />
                      </>
                    ) : (
                      <>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/practice/:subcategory" element={<PracticeScreen />} />
                        <Route path="/practice" element={<PracticeScreen />} />
                        <Route path="/summary" element={<SessionSummary />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </>
                    )}
                  </Routes>
                </div>
                <footer className="app-footer">
                  <p>ACT® is a registered trademark of ACT, Inc. This website is not endorsed or approved by ACT, Inc.</p>
                  <p><Link to="/privacy">Privacy Policy</Link></p>
                </footer>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
