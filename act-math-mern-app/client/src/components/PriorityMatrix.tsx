import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { authenticatedFetch } from '../utils/api';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface MatrixData {
  subcategory: string;
  accuracy: number;
  avgTime: number;
}

// --- Helper function for point color based on quadrant ---
const getQuadrantColor = (accuracy: number, avgTime: number) => {
  if (accuracy >= 75 && avgTime <= 60) return 'rgba(75, 192, 192, 0.9)'; // Strength Zone (Green)
  if (accuracy < 75 && avgTime > 60) return 'rgba(255, 99, 132, 0.9)';   // Knowledge Gap (Red)
  return 'rgba(255, 159, 64, 0.9)'; // Speed Trap or Weakness Zone (Orange)
};

// --- Chart.js Plugin for Target Zone Background ---
const targetZoneBackground = {
  id: 'targetZoneBackground',
  beforeDraw(chart: ChartJS) {
    const { ctx, chartArea: { top, bottom }, scales: { x, y } } = chart;
    const lowerX = x.getPixelForValue(90);
    const upperX = x.getPixelForValue(100);
    const lowerY = y.getPixelForValue(0);
    const upperY = y.getPixelForValue(60);

    ctx.save();
    ctx.fillStyle = 'rgba(75, 192, 192, 0.1)'; // Light green
    ctx.fillRect(lowerX, upperY, upperX - lowerX, lowerY - upperY);
    ctx.restore();
  },
};

ChartJS.register(targetZoneBackground);

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

  const maxTime = Math.max(...matrixData.map(d => d.avgTime), 120); // Default to 120s (2min)

  const chartData = {
    datasets: [
      {
        label: 'Subcategories',
        data: matrixData.map(d => ({ x: d.accuracy, y: d.avgTime, label: d.subcategory })),
        backgroundColor: matrixData.map(d => getQuadrantColor(d.accuracy, d.avgTime)),
        pointRadius: 8,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: { display: true, text: 'Accuracy (%)' },
        min: 0,
        max: 100,
      },
      y: {
        title: { display: true, text: 'Average Time' },
        beginAtZero: true,
        max: maxTime,
        ticks: {
          callback: function(value: any) {
            const minutes = Math.floor(value / 60);
            const seconds = (value % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
          }
        }
      },
    },
    plugins: {
      tooltip: { callbacks: { label: (c: any) => c.raw.label || '' } },
      legend: { display: false },
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
          {matrixData.length > 0 ? <Scatter data={chartData} options={options as any} /> : <p className="text-muted mt-3">Complete a session to see your priority matrix!</p>}
        </div>
        <Row className="text-center mt-3 small text-muted">
          <Col><strong>🔴 Knowledge Gap:</strong> Low accuracy, slow speed.</Col>
          <Col><strong>🟠 Speed Trap / Weakness:</strong> Inaccurate or slow.</Col>
          <Col><strong>🟢 Strength Zone:</strong> High accuracy, fast speed.</Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PriorityMatrix;
