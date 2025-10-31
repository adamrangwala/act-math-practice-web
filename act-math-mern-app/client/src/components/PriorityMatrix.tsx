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

  const maxTime = Math.max(...matrixData.map(d => d.avgTime), 90);

  const getQuadrant = (accuracy: number, avgTime: number) => {
    if (accuracy < 75 && avgTime > 75) return 'high-priority'; // Red
    if (accuracy < 75 && avgTime <= 75) return 'review-concepts'; // Orange
    if (accuracy >= 75 && avgTime > 75) return 'drill-for-speed'; // Yellow
    return 'strengths'; // Green
  };

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="my-4">{error}</Alert>;

  return (
    <div className="priority-matrix-card">
      <div className="priority-matrix-header">
        <div className="d-flex justify-content-center align-items-center gap-2">
          <h3>Your Action Plan</h3>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="matrix-info-tooltip">
                The position of each skill dot on this chart is based on your rolling average performance (accuracy and time) over your recent attempts. This gives you a stable and accurate view of your long-term mastery.
              </Tooltip>
            }
          >
            <span className="info-icon">ⓘ</span>
          </OverlayTrigger>
        </div>
        <p>Where to focus next, based on your speed and accuracy.</p>
      </div>
      {matrixData.length > 0 ? (
        <div className="priority-matrix-wrapper">
          <div className="priority-matrix">
            {/* Quadrants - Order defines the grid layout: top-left, top-right, bottom-left, bottom-right */}
            <div className="quadrant high-priority">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="high-priority-tooltip">
                    You're taking a while and still getting these wrong. Review the core concepts for these topics first.
                  </Tooltip>
                }
              >
                <span className="quadrant-label">High Priority</span>
              </OverlayTrigger>
            </div>
            <div className="quadrant drill-for-speed">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="drill-for-speed-tooltip">
                    You know the material, but you're slow. Use targeted practice to build speed.
                  </Tooltip>
                }
              >
                <span className="quadrant-label">Drill for Speed</span>
              </OverlayTrigger>
            </div>
            <div className="quadrant review-concepts">
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="review-concepts-tooltip">
                    You're answering fast but making mistakes. Slow down and double-check your work here.
                  </Tooltip>
                }
              >
                <span className="quadrant-label">Review Concepts</span>
              </OverlayTrigger>
            </div>
            <div className="quadrant strengths">
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="strengths-tooltip">
                    You've mastered these! You're both fast and accurate.
                  </Tooltip>
                }
              >
                <span className="quadrant-label">Strengths</span>
              </OverlayTrigger>
            </div>

            {/* Data Points */}
            {matrixData.map(data => (
              <OverlayTrigger
                key={data.subcategory}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-${data.subcategory}`}>
                    <strong>{data.subcategory}</strong><br />
                    Accuracy: {data.accuracy.toFixed(0)}%<br />
                    Avg. Time: {data.avgTime.toFixed(1)}s
                  </Tooltip>
                }
              >
                <div
                  className={`matrix-dot ${getQuadrant(data.accuracy, data.avgTime)}`}
                  style={{
                    left: `${data.accuracy}%`,
                    bottom: `${(data.avgTime / maxTime) * 100}%`,
                  }}
                />
              </OverlayTrigger>
            ))}
          </div>
          {/* Axes */}
          <div className="axis x-axis">
            <span>Accuracy (%)</span>
          </div>
          <div className="axis y-axis">
            <span>Avg. Time (s)</span>
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

export default PriorityMatrix;