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

function App() {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser ? (
        <>
          <Navbar /> {/* Use the new Navbar component */}
          <div className="app-container">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/practice/:subcategory" element={<PracticeScreen />} />
              <Route path="/practice" element={<PracticeScreen />} />
              <Route path="/summary" element={<SessionSummary />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
