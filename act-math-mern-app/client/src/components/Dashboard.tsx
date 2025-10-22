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
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null); // New state to manage view

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) {
        setLoading(false); // <-- This is the crucial fix
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
    // ... (handleStart logic remains the same)
  };

  if (loading || isNewUser === null) { // Keep loading until we know if user is new
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <div className="mt-5"><Alert variant="danger">{error}</Alert></div>;
  }

  // --- Conditional Rendering for New vs. Returning Users ---
  if (isNewUser) {
    return (
      <div className="mt-5 text-center">
        {/* ... (Welcome screen JSX remains the same) */}
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