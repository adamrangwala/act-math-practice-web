import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import PracticeScreen from './components/PracticeScreen';
import Dashboard from './components/Dashboard';
import SessionSummary from './components/SessionSummary';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import PrivacyPolicy from './components/PrivacyPolicy';
import Onboarding from './components/Onboarding';
import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import './App.css';

// A layout component for authenticated users
const AppLayout: React.FC = () => (
  <>
    <Navbar />
    <div className="app-container">
      <Outlet /> {/* Nested routes will render here */}
    </div>
    <footer className="app-footer">
      <p>ACT® is a registered trademark of ACT, Inc. This website is not endorsed or approved by ACT, Inc.</p>
      <p><Link to="/privacy">Privacy Policy</Link></p>
    </footer>
  </>
);

// A component to guard routes that require authentication
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser === undefined) {
    // Auth state is still loading
    return <div className="text-center mt-5">Loading...</div>;
  }
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  const { currentUser, isNewUser } = useAuth();

  if (currentUser === undefined) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route element={<AppLayout />}>
                {isNewUser ? (
                  <>
                    <Route path="onboarding" element={<Onboarding />} />
                    <Route path="practice" element={<PracticeScreen />} />
                    <Route path="*" element={<Navigate to="/onboarding" />} />
                  </>
                ) : (
                  <>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="practice/:subcategory" element={<PracticeScreen />} />
                    <Route path="practice" element={<PracticeScreen />} />
                    <Route path="summary" element={<SessionSummary />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </>
                )}
              </Route>
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;