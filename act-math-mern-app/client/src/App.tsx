import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import PracticeScreen from './components/PracticeScreen';
import Dashboard from './components/Dashboard';
import SessionSummary from './components/SessionSummary';
import Settings from './components/Settings';
import { auth } from './config/firebase';
import { signOut } from 'firebase/auth';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

function App() {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      {currentUser ? (
        <>
          <Container className="mt-4 text-center">
            <h1 className="display-4">ACT Math Practice</h1>
          </Container>
          <Navbar bg="light" variant="light" expand="lg" className="mb-4 mt-2">
            <Container>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/practice">Practice</Nav.Link>
                </Nav>
                <Nav>
                  <NavDropdown title={currentUser.displayName || currentUser.email} id="basic-nav-dropdown" align="end">
                    <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>
                      Sign Out
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <Container>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/practice" element={<PracticeScreen />} />
              <Route path="/summary" element={<SessionSummary />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Container>
        </>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
