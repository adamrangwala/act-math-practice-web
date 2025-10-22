import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import PriorityMatrix from './PriorityMatrix';
import { authenticatedFetch } from '../utils/api';

interface DashboardStats {
  questionsDue: number;
  subcategoriesMastered: number;
  overallAccuracy: number;
  totalSubcategoriesTracked: number;
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await authenticatedFetch('/api/stats/dashboard');
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <div className="mt-5"><Alert variant="danger">{error}</Alert></div>;
  }

  // A simple check for new users. If there's no stats, show a welcome message.
  if (!stats || stats.totalSubcategoriesTracked === 0) {
    return (
      <div className="mt-5 text-center">
        <Card className="p-4 p-md-5">
          <Card.Body>
            <Card.Title as="h2" className="mb-3">Welcome!</Card.Title>
            <Card.Text className="lead mb-4">
              Complete your first practice session to unlock your personalized dashboard and Priority Matrix.
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // A simple check for new users. If there's no stats or progress, show a welcome message.
  if (!stats || stats.totalSubcategoriesTracked === 0) {
    return (
      <div className="mt-5 text-center">
        <Card className="p-4 p-md-5">
          <Card.Body>
            <Card.Title as="h2" className="mb-3">Welcome!</Card.Title>
            <Card.Text className="lead mb-4">
              Complete your first practice session to unlock your personalized dashboard and Priority Matrix.
            </Card.Text>
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