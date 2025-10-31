import React, { useState, useEffect } from 'react';
import { Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch } from '../utils/api';
import './PriorityMatrix.css';

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
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const maxTime = 120; // Static max time for a stable Y-axis

  const getQuadrant = (accuracy: number, avgTime: number) => {
    if (accuracy >= 80 && avgTime < 60) return 'strengths';
    if (accuracy >= 80 && avgTime >= 60) return 'drill-for-speed';
    if (accuracy < 80 && avgTime < 60) return 'review-concepts';
    return 'high-priority'; // accuracy < 80 && avgTime >= 60
  };

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="my-4">{error}</Alert>;

  return (
    <div className="priority-matrix-container">
      <h3 className="matrix-title">Priority Matrix</h3>
      {matrixData.length > 0 ? (
        <div className="matrix-wrapper">
          <div className="y-axis-label">Avg. Time (s)</div>
          <div className="x-axis-label">Accuracy (%)</div>
          <div className="y-axis">
            <span>{maxTime}</span>
            <span>{maxTime / 2}</span>
            <span>0</span>
          </div>
          <div className="matrix">
            <div className="quadrant high-priority"><span>High Priority</span></div>
            <div className="quadrant drill-for-speed"><span>Drill for Speed</span></div>
            <div className="quadrant review-concepts"><span>Review Concepts</span></div>
            <div className="quadrant strengths"><span>Strengths</span></div>
            
            {matrixData.map(data => (
              <OverlayTrigger
                key={data.subcategory}
                placement="top"
                overlay={<Tooltip id={`tooltip-${data.subcategory}`}>{data.subcategory}</Tooltip>}
              >
                <div
                  className="matrix-dot"
                  style={{
                    left: `${data.accuracy}%`,
                    bottom: `${Math.min(100, (data.avgTime / maxTime) * 100)}%`,
                  }}
                ></div>
              </OverlayTrigger>
            ))}
          </div>
          <div className="x-axis">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      ) : (
        <div className="matrix-placeholder">
          <p>Complete a practice session to see your Priority Matrix!</p>
        </div>
      )}
    </div>
  );
};
};

export default PriorityMatrix;