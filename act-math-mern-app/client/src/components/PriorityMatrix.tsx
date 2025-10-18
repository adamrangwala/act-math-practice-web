import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface MatrixData {
  subcategory: string;
  accuracy: number;
  avgTime: number;
}

const PriorityMatrix = () => {
  const { currentUser } = useAuth();
  const [matrixData, setMatrixData] = useState<MatrixData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatrixData = async () => {
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch('/api/stats/priority-matrix', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch priority matrix data.');
        const data = await response.json();
        setMatrixData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatrixData();
  }, [currentUser]);

  const chartData = {
    datasets: [
      {
        label: 'Subcategories',
        data: matrixData.map(d => ({ x: d.accuracy, y: d.avgTime, label: d.subcategory })),
        backgroundColor: matrixData.map(d => {
          if (d.accuracy >= 80 && d.avgTime <= 60) return 'rgba(75, 192, 192, 0.8)'; // Green
          if (d.accuracy < 60) return 'rgba(255, 99, 132, 0.8)'; // Red
          return 'rgba(255, 159, 64, 0.8)'; // Orange
        }),
        pointRadius: 8,
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
        title: { display: true, text: 'Average Time (s)' },
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.raw.label || '';
          },
        },
      },
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
        <Card.Subtitle className="mb-2 text-muted">
          Accuracy vs. Average Time per Topic
        </Card.Subtitle>
        <div style={{ height: '400px' }}>
          {matrixData.length > 0 ? <Scatter data={chartData} options={options} /> : <p className="text-muted mt-3">Complete a session to see your priority matrix!</p>}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PriorityMatrix;
