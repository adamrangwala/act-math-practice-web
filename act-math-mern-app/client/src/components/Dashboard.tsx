import React, { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import './Dashboard.css';

interface SubcategoryStat {
  subcategory: string;
  accuracy: number;
  avgTime: number;
}

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SubcategoryStat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await authenticatedFetch('/api/stats/priority-matrix');
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 60) return 'accuracy-red';
    if (accuracy >= 60 && accuracy <= 80) return 'accuracy-orange';
    return 'accuracy-green';
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <div className="mt-5"><Alert variant="danger">{error}</Alert></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-message">
        Welcome back, {currentUser?.displayName?.split(' ')[0] || 'friend'}! 👋
      </div>

      <div className="practice-button-container">
        <button className="practice-button" onClick={() => navigate('/practice')}>
          Begin Daily Practice
        </button>
      </div>

      <h2 className="skills-breakdown-title">Skills Breakdown</h2>
      <div className="skills-list">
        {stats && stats.map((skill) => (
          <div key={skill.subcategory} className="skill-item" onClick={() => alert(`Starting practice for ${skill.subcategory}`)}>
            <div className="skill-item-header">
              <span className="skill-name">{skill.subcategory}</span>
              <span className={`skill-accuracy ${getAccuracyColor(skill.accuracy)}`}>
                {skill.accuracy.toFixed(0)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-inner"
                style={{ width: `${skill.accuracy}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
