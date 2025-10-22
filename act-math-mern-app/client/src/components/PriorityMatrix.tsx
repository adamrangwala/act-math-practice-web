import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, ChartArea } from 'chart.js';
import { authenticatedFetch } from '../utils/api';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface MatrixData {
  subcategory: string;
  accuracy: number;
  avgTime: number;
}

// --- Helper function for gradient color ---
const getPriorityColor = (accuracy: number, avgTime: number) => {
  // Normalize values (e.g., time against a 90s benchmark)
  const accuracyScore = accuracy / 100;
  const timeScore = Math.min(avgTime, 90) / 90;

  // Invert accuracy so low accuracy = high score
  const priority = (1 - accuracyScore) * 0.6 + timeScore * 0.4;

  const r = Math.floor(255 * Math.min(1, priority * 2));
  const g = Math.floor(255 * (1 - priority));
  return `rgba(${r}, ${g}, 0, 0.8)`;
};

// --- Chart.js Plugin for Quadrant Backgrounds ---
const quadrantBackgrounds = {
  id: 'quadrantBackgrounds',
  beforeDraw(chart: ChartJS) {
    const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;
    const midX = x.getPixelForValue(75);
    const midY = y.getPixelForValue(60);

    ctx.save();
    // Top-Left (Knowledge Gap - Red)
    ctx.fillStyle = 'rgba(255, 99, 132, 0.1)';
    ctx.fillRect(left, top, midX - left, midY - top);
    // Top-Right (Speed Trap - Orange)
    ctx.fillStyle = 'rgba(255, 159, 64, 0.1)';
    ctx.fillRect(midX, top, right - midX, midY - top);
    // Bottom-Left (Weakness Zone - Orange)
    ctx.fillStyle = 'rgba(255, 159, 64, 0.1)';
    ctx.fillRect(left, midY, midX - left, bottom - midY);
    // Bottom-Right (Strength Zone - Green)
    ctx.fillStyle = 'rgba(75, 192, 192, 0.1)';
    ctx.fillRect(midX, midY, right - midX, bottom - midY);
    ctx.restore();
  },
};

ChartJS.register(quadrantBackgrounds);

const PriorityMatrix = () => {
  const { currentUser } = useAuth();
  const [matrixData, setMatrixData] = useState<MatrixData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const fetchMatrixData = async () => {
        try {
          const data = await authenticatedFetch('/api/stats/priority-matrix');
          setMatrixData(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchMatrixData();
    }
  }, [currentUser]);

  const chartData = {
    datasets: [
      {
        label: 'Subcategories',
        data: matrixData.map(d => ({ x: d.accuracy, y: d.avgTime, label: d.subcategory })),
        backgroundColor: matrixData.map(d => getPriorityColor(d.accuracy, d.avgTime)),
        pointRadius: 8,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      x: { title: { display: true, text: 'Accuracy (%)' }, min: 0, max: 100 },
      y: { title: { display: true, text: 'Average Time (s)' }, beginAtZero: true },
    },
    plugins: {
      tooltip: { callbacks: { label: (c: any) => c.raw.label || '' } },
      legend: { display: false },
    },
    layout: {
      padding: 10 // Adds padding to prevent points from being cut off
    },
    maintainAspectRatio: false,
  };

  if (loading) return <div className="text-center mt-3"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>Priority Matrix</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Your Performance Quadrants</Card.Subtitle>
        <div style={{ position: 'relative', height: '400px' }}>
          {matrixData.length > 0 ? <Scatter data={chartData} options={options} /> : <p className="text-muted mt-3">Complete a session to see your priority matrix!</p>}
        </div>
        <Row className="text-center mt-3 small text-muted">
          <Col><strong>🔴 Knowledge Gap:</strong> Low accuracy, slow speed. Start here.</Col>
          <Col><strong>🟠 Speed Trap:</strong> High accuracy, but slow. Practice to improve timing.</Col>
          <Col><strong>🟢 Strength Zone:</strong> High accuracy, fast speed. Maintain this!</Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PriorityMatrix;