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

// --- Chart.js Plugin for Quadrant Backgrounds ---
const quadrantBackgrounds = {
  id: 'quadrantBackgrounds',
  beforeDraw(chart: ChartJS) {
    const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;
    const midX = x.getPixelForValue(75); // 75% accuracy threshold
    const midY = y.getPixelForValue(60); // 60 seconds time threshold

    ctx.save();
    // Top-Left (Knowledge Gap - Red)
    ctx.fillStyle = 'rgba(255, 99, 132, 0.1)';
    ctx.fillRect(left, top, midX - left, midY - top);
    // Top-Right (Speed Trap - Orange)
    ctx.fillStyle = 'rgba(255, 159, 64, 0.1)';
    ctx.fillRect(midX, top, right - midX, midY - top);
    // Bottom-Left (Weakness Zone - also Orange)
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
        backgroundColor: 'rgba(2, 117, 216, 0.8)', // A single, professional blue color
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
        min: -5,   // Grace padding
        max: 105,  // Grace padding
      },
      y: {
        title: { display: true, text: 'Average Time (s)' },
        beginAtZero: true,
        grace: '5%', // Add 5% padding to the top
      },
    },
    plugins: {
      tooltip: { callbacks: { label: (c: any) => c.raw.label || '' } },
      legend: { display: false },
    },
    layout: {
      padding: { top: 10, bottom: 10 } // Ensure top padding is also handled
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
          <Col xs={12} md={6} className="mb-2"><strong>🔴 Knowledge Gap:</strong> Low accuracy, slow speed. Focus here first.</Col>
          <Col xs={12} md={6} className="mb-2"><strong>🟠 Speed Trap / Weakness:</strong> Either slow but accurate, or fast but inaccurate. Drill these topics.</Col>
          <Col xs={12} md={12}><strong>🟢 Strength Zone:</strong> High accuracy, fast speed. Maintain your skills here.</Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PriorityMatrix;
