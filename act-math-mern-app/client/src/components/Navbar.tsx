import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeedbackModal from './FeedbackModal'; // Import FeedbackModal
import './Navbar.css';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // State for feedback modal

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
      // Optionally, show an error message to the user
    }
  };

  const handleOpenFeedbackModal = () => setShowFeedbackModal(true);
  const handleCloseFeedbackModal = () => setShowFeedbackModal(false);

  return (
    <nav className="app-navbar">
      <Link to="/dashboard" className="navbar-brand">ACT Math Sprint</Link>
      <div className="navbar-nav">
        <button onClick={handleOpenFeedbackModal} className="nav-link feedback-button">Feedback</button>
        <Link to="/settings" className="nav-link">Settings</Link>
        <a href="#" onClick={handleSignOut} className="nav-link">Sign Out</a>
      </div>
      <FeedbackModal show={showFeedbackModal} onClose={handleCloseFeedbackModal} />
    </nav>
  );
};

export default Navbar;
