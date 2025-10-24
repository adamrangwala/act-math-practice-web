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

interface DashboardStats {
  questionsDue: number;
  subcategoriesMastered: number;
  overallAccuracy: number;
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [skillStats, setSkillStats] = useState<SubcategoryStat[] | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllStats = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        // Fetch both sets of stats in parallel
        const [priorityData, dashboardData] = await Promise.all([
          authenticatedFetch('/api/stats/priority-matrix'),
          authenticatedFetch('/api/stats/dashboard')
        ]);
        setSkillStats(priorityData);
        setDashboardStats(dashboardData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
  }, [currentUser]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 60) return 'accuracy-red';
    if (accuracy >= 60 && accuracy <= 80) return 'accuracy-orange';
    return 'accuracy-green';
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <div className="mt-5"><Alert variant="danger">{error}</Alert></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-header">
        <h2>Welcome back, {currentUser?.displayName}! 👋</h2>
        <p>Ready to practice some math today?</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon due-today"></div>
          <div className="stat-info">
            <span className="stat-label">Due Today</span>
            <span className="stat-value">{dashboardStats?.questionsDue ?? 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon mastered"></div>
          <div className="stat-info">
            <span className="stat-label">Mastered</span>
            <span className="stat-value">{dashboardStats?.subcategoriesMastered ?? 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accuracy"></div>
          <div className="stat-info">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{dashboardStats?.overallAccuracy.toFixed(1) ?? 0}%</span>
          </div>
        </div>
      </div>

      <div className="practice-button-container">
        <button className="practice-button" onClick={() => navigate('/practice')}>
          Begin Daily Practice
        </button>
      </div>

      <h2 className="skills-breakdown-title">Skills Breakdown</h2>
      <div className="skills-list">
        {skillStats && skillStats.map((skill) => (
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
