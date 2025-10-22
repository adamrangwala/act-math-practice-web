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

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [dailyQuestionLimit, setDailyQuestionLimit] = useState(15);

  useEffect(() => {
    // The fetch logic is now INSIDE the useEffect hook
    const fetchStats = async () => {
      if (!currentUser) {
        setLoading(false); // Handle the case where the user logs out
        return;
      }
      try {
        const data = await authenticatedFetch('/api/stats/dashboard');
        setStats(data);
        if (data && data.totalSubcategoriesTracked > 0) {
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

    fetchStats();
  }, [currentUser]);

  const handleStart = async () => {
    try {
      await authenticatedFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ dailyQuestionLimit }),
      });
      navigate('/practice');
    } catch (err: any) {
      setError('Failed to save settings. Please try again.');
      console.error(err);
    }
  };

  if (loading || isNewUser === null) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <div className="mt-5"><Alert variant="danger">{error}</Alert></div>;
  }

  if (isNewUser) {
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
      <Row>
        <Col md={4} className="mb-4">
          <Card className="text-center h-100">
            <Card.Body>
              <h6 className="text-muted">Topics Due for Review</h6>
              <Card.Text className="fs-1 fw-bold">{stats?.questionsDue}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="text-center h-100">
            <Card.Body>
              <h6 className="text-muted">Topics Mastered</h6>
              <Card.Text className="fs-1 fw-bold">
                {stats?.subcategoriesMastered}
                <span className="fs-6"> / {stats?.totalSubcategoriesTracked}</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="text-center h-100">
            <Card.Body>
              <h6 className="text-muted">Overall Accuracy</h6>
              <Card.Text className="fs-1 fw-bold">{stats?.overallAccuracy.toFixed(1)}%</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <PriorityMatrix />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
