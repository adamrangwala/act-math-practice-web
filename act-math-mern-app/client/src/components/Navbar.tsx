import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

interface NavbarProps {
  onOpenFeedbackModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenFeedbackModal }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="app-navbar">
      <Link to="/dashboard" className="navbar-brand">ACT Math Sprint</Link>
      <div className="navbar-nav">
        <button onClick={onOpenFeedbackModal} className="nav-link feedback-button">Feedback</button>
        <Link to="/settings" className="nav-link">Settings</Link>
        <a href="#" onClick={handleSignOut} className="nav-link">Sign Out</a>
      </div>
    </nav>
  );
};

export default Navbar;
