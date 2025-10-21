import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import PriorityMatrix from './PriorityMatrix';

interface DashboardStats {
  questionsDue: number;
  subcategoriesMastered: number;
  overallAccuracy: number;
  totalSubcategoriesTracked: number;
}

import { authenticatedFetch } from '../utils/api';

// ... (imports)

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
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