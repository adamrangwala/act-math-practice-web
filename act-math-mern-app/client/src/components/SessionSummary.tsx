import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col, ListGroup, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

const SessionSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionStats, practiceQuestions } = location.state || { sessionStats: { accuracy: 0, avgTime: 0 }, practiceQuestions: [] };

  const handleNewSession = () => {
    navigate('/practice');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const formatTime = (seconds: number) => {
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  const getTimeColor = (seconds: number) => {
    const roundedSeconds = Math.round(seconds);
    if (roundedSeconds < 60) return 'success'; // Green
    if (roundedSeconds <= 90) return 'warning'; // Orange
    return 'danger'; // Dark Red
  };

  const renderTooltip = (props: any, subcategories: string[]) => (
    <Tooltip id="button-tooltip" {...props}>
      {subcategories.join(', ')}
    </Tooltip>
  );

  return (
    <div className="mt-4">
      <Card className="text-center shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="mb-4">Session Complete!</Card.Title>
          <Row className="mb-4">
            <Col>
              <div className="p-3 bg-light rounded">
                <h4 className="mb-1">Accuracy</h4>
                <p className="h2 mb-0">
                  {sessionStats.correctCount} / {sessionStats.totalCount} 
                  <span className="fs-5 text-muted"> ({sessionStats.accuracy.toFixed(1)}%)</span>
                </p>
              </div>
            </Col>
            <Col>
              <div className="p-3 bg-light rounded">
                <h4 className="mb-1">Average Time per Question</h4>
                <p className="h2 mb-0">{sessionStats.avgTime.toFixed(1)}s</p>
              </div>
            </Col>
          </Row>
          <ListGroup variant="flush">
            {practiceQuestions.map((q, index) => (
              <ListGroup.Item 
                key={index} 
                className={`d-flex align-items-center text-start ${q.isCorrect ? 'bg-success-subtle' : 'bg-danger-subtle'}`}
              >
                <div className="fw-bold" style={{ width: '120px' }}>
                  Question {index + 1}
                </div>
                <div className="flex-grow-1 mx-3">
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props) => renderTooltip(props, q.subcategories)}
                  >
                    <div>
                      {q.subcategories.slice(0, 2).map((sub: string) => (
                        <Badge pill bg="secondary" key={sub} className="me-1 fw-normal">
                          {sub}
                        </Badge>
                      ))}
                      {q.subcategories.length > 2 && (
                        <Badge pill bg="dark" className="me-1 fw-normal">
                          +{q.subcategories.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </OverlayTrigger>
                </div>
                <div className="text-end" style={{ width: '80px' }}>
                  <span className={`fw-bold text-${getTimeColor(q.timeSpent)}`}>
                    {formatTime(q.timeSpent)}
                  </span>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button variant="primary" size="lg" onClick={handleNewSession}>Practice More</Button>
            <Button variant="secondary" size="lg" onClick={handleDashboard}>Back to Dashboard</Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SessionSummary;
