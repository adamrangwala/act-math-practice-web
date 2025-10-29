import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch } from '../utils/api';
import './Onboarding.css';

const Onboarding = () => {
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const { setIsNewUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authenticatedFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ dailyQuestionLimit: limit }),
      });
      // Mark the user as not new anymore
      if (setIsNewUser) {
        setIsNewUser(false);
      }
      // Navigate to the main dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to save settings:", error);
      setLoading(false);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>Welcome to ACT Math Practice!</h1>
        <p>Let's get you started. Set a goal for how many questions you'd like to practice in each daily session.</p>
        
        <div className="slider-container">
          <label htmlFor="question-limit-slider">Daily Questions: <strong>{limit}</strong></label>
          <input
            type="range"
            id="question-limit-slider"
            min="5"
            max="25"
            step="5"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="slider"
          />
          <div className="slider-labels">
            <span>5</span>
            <span>25</span>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="continue-button">
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
