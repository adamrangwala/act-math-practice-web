import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import PracticeScreen from './components/PracticeScreen';
import Dashboard from './components/Dashboard';
import SessionSummary from './components/SessionSummary';
import { auth } from './config/firebase';
import { signOut } from 'firebase/auth';
import { Navbar, Container, Button, Nav } from 'react-bootstrap';
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
          <Navbar bg="light" variant="light" expand="lg" className="mb-4">
            <Container>
              <Navbar.Brand as={Link} to="/dashboard">ACT Math Practice</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/practice">Practice</Nav.Link>
                </Nav>
                <Navbar.Text className="me-3">
                  Signed in as: {currentUser.displayName || currentUser.email}
                </Navbar.Text>
                <Button variant="primary" onClick={handleLogout}>Sign Out</Button>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <Container>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/practice" element={<PracticeScreen />} />
              <Route path="/summary" element={<SessionSummary />} />
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