import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';

// ... (interface and other imports)

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyQuestionLimit, setDailyQuestionLimit] = useState(15); // New state for the slider

  // ... (useEffect and fetchStats)

  const handleStart = async () => {
    try {
      // First, save the user's chosen setting
      await authenticatedFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ dailyQuestionLimit }),
      });
      // Then, navigate to the practice screen
      navigate('/practice');
    } catch (err: any) {
      setError('Failed to save settings. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <div className="mt-5"><Alert variant="danger">{error}</Alert></div>;
  }

  // --- Conditional Rendering for New vs. Returning Users ---
  if (!stats || stats.totalSubcategoriesTracked === 0) {
    return (
      <div className="mt-5 text-center">
        <Card className="p-4 p-md-5">
          <Card.Body>
            <Card.Title as="h2" className="mb-3">Welcome to Your ACT Math Trainer!</Card.Title>
            <Card.Text className="lead mb-4">
              To get started, choose how many questions you'd like in your first session. This will help us create your personalized study plan.
            </Card.Text>
            <Form.Group className="my-4">
              <Form.Label>Questions per session: <strong>{dailyQuestionLimit}</strong></Form.Label>
              <Form.Range
                value={dailyQuestionLimit}
                onChange={(e) => setDailyQuestionLimit(parseInt(e.target.value, 10))}
                min="5"
                max="25"
                step="1"
              />
              <small className="text-muted">We recommend 10-15 for a good baseline.</small>
            </Form.Group>
            <Button variant="primary" size="lg" onClick={handleStart}>
              Start Your First Session
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* ... (existing dashboard JSX with stats cards and PriorityMatrix) */}
    </div>
  );
};

export default Dashboard;