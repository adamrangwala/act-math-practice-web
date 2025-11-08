import React, { useState, useEffect } from 'react';
import { Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import PriorityMatrix from './PriorityMatrix';
import './Dashboard.css';

interface SubcategoryStat {
  subcategory: string;
  accuracy: number;
  avgTime: number;
  totalAttempts: number;
}

interface DashboardStats {
  practiceStreak: number;
  totalPracticeSessions: number;
  currentRollingAccuracy: number;
  previousRollingAccuracy: number;
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

  const getPerformanceTier = (accuracy: number) => {
    if (accuracy < 60) return <span className="tier-badge fair">Fair</span>;
    if (accuracy >= 60 && accuracy <= 80) return <span className="tier-badge good">Good</span>;
    return <span className="tier-badge great">Great</span>;
  };

  const getQuadrantInfo = (stat: SubcategoryStat) => {
    const { accuracy, avgTime } = stat;
    // These thresholds should ideally match the ones used in the PriorityMatrix component
    const accuracyThreshold = 75;
    const timeThreshold = 60;

    if (accuracy < accuracyThreshold) {
      return { 
        label: "High Priority", 
        className: "quadrant-priority",
        tooltip: "These are your top priority topics. Focus here to see the biggest score improvement." 
      };
    } else if (accuracy >= accuracyThreshold && avgTime > timeThreshold) {
      return { 
        label: "Build Speed", 
        className: "quadrant-speed",
        tooltip: "You're accurate but slow. Practice these to improve your timing and confidence."
      };
    } else { // accuracy >= accuracyThreshold && avgTime <= timeThreshold
      return { 
        label: "Strength", 
        className: "quadrant-strength",
        tooltip: "You've mastered these topics! Keep them fresh with occasional review."
      };
    }
  };

  const renderTrendArrow = (current: number, previous: number) => {
    if (!previous || current === previous) {
      return <span className="trend-arrow neutral">—</span>;
    }
    if (current > previous) {
      return <span className="trend-arrow up">▲</span>;
    }
    return <span className="trend-arrow down">▼</span>;
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
          <div className="stat-icon accuracy"></div>
                      <div className="stat-info">
                        <div className="d-flex align-items-center gap-2">
                          <span className="stat-label">Rolling Accuracy</span>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="rolling-accuracy-tooltip">
                                Your accuracy over your last 50 questions. This gives you a dynamic view of your recent performance.
                              </Tooltip>
                            }
                          >
                            <span className="info-icon">ⓘ</span>
                          </OverlayTrigger>
                        </div>
                        <div className="stat-value-with-trend">
                          <span className="stat-value">{dashboardStats?.currentRollingAccuracy.toFixed(0) ?? 0}%</span>
                          {dashboardStats && renderTrendArrow(dashboardStats.currentRollingAccuracy, dashboardStats.previousRollingAccuracy)}
                        </div>
                      </div>        </div>
        <div className="stat-card">
          <div className="stat-icon streak"></div>
          <div className="stat-info">
            <span className="stat-label">Day Streak</span>
            <span className="stat-value">{dashboardStats?.practiceStreak ?? 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon sessions"></div>
          <div className="stat-info">
            <span className="stat-label">Total Sessions</span>
            <span className="stat-value">{dashboardStats?.totalPracticeSessions ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="practice-button-container">
        <button className="practice-button" onClick={() => navigate('/practice')}>
          Begin Daily Practice
        </button>
      </div>

      <PriorityMatrix />

      <div className="skills-breakdown-header">
        <h2 className="skills-breakdown-title">Skills Breakdown</h2>
        <div className="skills-header-info">
          <span className="skill-count">
            {skillStats?.length ?? 0} / 58 Skills Assessed
          </span>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="skill-tooltip">
                A skill appears here once you've answered at least 3 questions from its subcategory.
              </Tooltip>
            }
          >
            <span className="info-icon">ⓘ</span>
          </OverlayTrigger>
        </div>
      </div>
      <div className="skills-list">
        {skillStats && skillStats.length > 0 ? (
          skillStats.map((skill) => {
            const quadrant = getQuadrantInfo(skill);
            return (
              <div key={skill.subcategory} className="skill-item" onClick={() => navigate(`/practice/${encodeURIComponent(skill.subcategory)}`)}>
                <div className="skill-item-header">
                  <div className="skill-name-group">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`quadrant-tooltip-${skill.subcategory}`}>{quadrant.tooltip}</Tooltip>}
                    >
                      <span className={`quadrant-badge ${quadrant.className}`}>{quadrant.label}</span>
                    </OverlayTrigger>
                    <span className="skill-name">{skill.subcategory}</span>
                  </div>
                  {getPerformanceTier(skill.accuracy)}
                </div>
                <div className="skill-details">
                  <span>🎯 Accuracy: {skill.accuracy.toFixed(0)}%</span>
                  <span>⏱️ Avg Time: {skill.avgTime.toFixed(1)}s</span>
                  <span>✏️ Problems: {skill.totalAttempts}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-inner"
                    style={{ width: `${skill.accuracy}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="skills-list-placeholder">
            <h4>Your Skills Breakdown will appear here.</h4>
            <p>Answer a few more questions in each category to unlock a detailed analysis of your strengths and weaknesses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;