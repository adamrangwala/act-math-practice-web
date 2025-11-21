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

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="my-4">{error}</Alert>;

  return (
    <div className="priority-matrix-container">
      <div className="matrix-header">
        <h3 className="matrix-title">Action Plan</h3>
        <p className="matrix-subtitle">Identify your weakest areas to guide your practice sessions.</p>
      </div>
      {matrixData.length > 0 ? (
        <div className="matrix-wrapper">
          <div className="y-axis-label">Average Time</div>
          <div className="y-axis">
            <span>{maxTime}s</span>
            <span>60s</span>
            <span>0s</span>
          </div>
          <div className="matrix-content">
            <div className="matrix">
              {/* Background Quadrants */}
              <div className="quadrant-bg high-priority-bg"></div>
              <div className="quadrant-bg drill-for-speed-bg"></div>
              <div className="quadrant-bg review-concepts-bg"></div>
              <div className="quadrant-bg strengths-bg"></div>

              {/* Labels */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="high-priority-tooltip">Accuracy is below 50%. Focus on understanding the core concepts for these topics first.</Tooltip>}
              >
                <div className="quadrant-label high-priority-label"><span>High Priority</span></div>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="drill-for-speed-tooltip">High accuracy but high time. Use timed drills on these topics to improve your speed.</Tooltip>}
              >
                <div className="quadrant-label drill-for-speed-label"><span>Drill for Speed</span></div>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="review-concepts-tooltip">Inconsistent accuracy. Slow down and review the fundamental concepts before practicing more.</Tooltip>}
              >
                <div className="quadrant-label review-concepts-label"><span>Review Concepts</span></div>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="strengths-tooltip">High accuracy and low time. These are your strengths! Maintain them with occasional practice.</Tooltip>}
              >
                <div className="quadrant-label strengths-label"><span>Strengths</span></div>
              </OverlayTrigger>

              {matrixData.map(data => (
                <OverlayTrigger
                  key={data.subcategory}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-${data.subcategory}`}>
                      <strong>{data.subcategory}</strong><br/>
                      Accuracy: {data.accuracy.toFixed(0)}%<br/>
                      Avg Time: {data.avgTime.toFixed(1)}s
                    </Tooltip>
                  }
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
              <span>0%</span>
              <span>50%</span>
              <span>80%</span>
              <span>100%</span>
            </div>
            <div className="x-axis-label">Accuracy</div>
          </div>
        </div>
      ) : (
        <div className="matrix-placeholder">
          <p>Complete a few more practice sessions to see your Action Plan!</p>
        </div>
      )}
    </div>
  );
};


export default PriorityMatrix;