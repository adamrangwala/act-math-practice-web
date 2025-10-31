import React, { useState, useEffect } from 'react';
import { Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import PriorityMatrix from './PriorityMatrix'; // Import the PriorityMatrix
import './Dashboard.css';

interface SubcategoryStat {
  subcategory: string;
  accuracy: number;
  avgTime: number;
  totalAttempts: number;
}
// ... (rest of the interface and component)
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
          skillStats.map((skill) => (
            <div key={skill.subcategory} className="skill-item" onClick={() => navigate(`/practice/${encodeURIComponent(skill.subcategory)}`)}>
              <div className="skill-item-header">
                <div className="skill-name-group">
                  <div className="skill-icon"></div>
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
          ))
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
