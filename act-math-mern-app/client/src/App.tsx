import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import PracticeScreen from './components/PracticeScreen';
import Dashboard from './components/Dashboard';
import SessionSummary from './components/SessionSummary';
import Settings from './components/Settings';
import Navbar from './components/Navbar'; // Import the new Navbar
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Onboarding from './components/Onboarding'; // Import the new Onboarding component

function App() {
  const { currentUser, isNewUser } = useAuth();

  return (
    <>
      {currentUser ? (
        <>
          <Navbar />
          <div className="app-container">
            <Routes>
              {isNewUser ? (
                // If the user is new, all paths lead to onboarding
                <>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="*" element={<Navigate to="/onboarding" />} />
                </>
              ) : (
                // If they are an existing user, show the main app
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
          </footer>
        </>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
