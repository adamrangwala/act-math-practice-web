import PracticeStreak from './PracticeStreak'; // New import
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import PriorityMatrix from './PriorityMatrix';

interface DashboardStats {
  questionsDue: number;
  subcategoriesMastered: number;
  overallAccuracy: number;
  totalSubcategoriesTracked: number;
}

import { Modal } from 'react-bootstrap'; // New import

// ... (imports)

const Dashboard = () => {
  // ... (state declarations)
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakLength, setStreakLength] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const [statsData, streakResult] = await Promise.all([
          authenticatedFetch('/api/stats/dashboard'),
          authenticatedFetch('/api/stats/streak')
        ]);
        
        setStats(statsData);
        const practiceDays = streakResult.practiceDays || [];
        setStreakData(practiceDays);

        // --- New Streak Celebration Logic ---
        const today = new Date().toISOString().split('T')[0];
        if (practiceDays.includes(today)) {
          const celebrationShown = sessionStorage.getItem('streakCelebrationShown');
          if (!celebrationShown) {
            const currentStreak = calculateStreak(practiceDays);
            if (currentStreak > 1) {
              setStreakLength(currentStreak);
              setShowStreakModal(true);
              sessionStorage.setItem('streakCelebrationShown', 'true');
            }
          }
        }
        // --- End of New Logic ---

        if (statsData && statsData.totalSubcategoriesTracked > 0) {
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const calculateStreak = (dates: string[]) => {
    const sortedDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    const today = new Date();
    
    // Check if the most recent day is today or yesterday
    if (sortedDates.length > 0) {
      const mostRecentDate = new Date(sortedDates[0]);
      const diffTime = today.getTime() - mostRecentDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      if (diffDays <= 1.5) { // Allow for timezone differences
        streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i-1]);
          const previousDate = new Date(sortedDates[i]);
          const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24);
          if (dayDiff <= 1.5) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    return streak;
  };

  // ... (handleStart, loading, error, and new user rendering)

  return (
    <>
      <div className="mt-4">
        <PracticeStreak practiceDays={streakData} />
        {/* ... (rest of dashboard) */}
      </div>

      <Modal show={showStreakModal} onHide={() => setShowStreakModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <h1 style={{ fontSize: '4rem' }}>🔥</h1>
          <h2>{streakLength}-Day Streak!</h2>
          <p className="lead text-muted">
            Great job! Consistency is the key to improving your score. Keep the flame alive!
          </p>
          <Button variant="primary" onClick={() => setShowStreakModal(false)}>
            Continue
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;
