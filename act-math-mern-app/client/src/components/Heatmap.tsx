import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

interface HeatmapData {
  subcategory: string;
  mastery: number; // 0.0 to 1.0
}

// Helper function to get a color from red to green based on mastery
const getMasteryColor = (mastery: number) => {
  const hue = mastery * 120; // 0 is red, 120 is green
  return `hsl(${hue}, 75%, 50%)`;
};

const Heatmap = () => {
  const { currentUser } = useAuth();
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch('/api/stats/heatmap', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch heatmap data.');
        }
        const data = await response.json();
        // Sort data from lowest mastery to highest
        data.sort((a: HeatmapData, b: HeatmapData) => a.mastery - b.mastery);
        setHeatmapData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center mt-3"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Alert variant="danger" className="mt-3">{error}</Alert>;
  }

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>Topic Mastery</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Your performance across all topics. Weakest topics are shown first.
        </Card.Subtitle>
        <ListGroup variant="flush">
          {heatmapData.length > 0 ? heatmapData.map(item => (
            <ListGroup.Item key={item.subcategory} className="d-flex justify-content-between align-items-center">
              {item.subcategory}
              <div
                style={{
                  width: '100px',
                  height: '20px',
                  backgroundColor: getMasteryColor(item.mastery),
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem',
                }}
              >
                {`${Math.round(item.mastery * 100)}%`}
              </div>
            </ListGroup.Item>
          )) : <p className="text-muted mt-3">No practice data yet. Complete a session to see your mastery heatmap!</p>}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default Heatmap;
