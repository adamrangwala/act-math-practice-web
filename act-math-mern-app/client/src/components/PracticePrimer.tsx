import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import './PracticePrimer.css';

const PracticePrimer = () => {
  const navigate = useNavigate();

  const handleBeginPractice = () => {
    navigate('/practice');
  };

  return (
    <div className="primer-container">
      <Card className="primer-card">
        <Card.Body>
          <Card.Title as="h1" className="text-center mb-4">Get Ready for Your First Practice Session!</Card.Title>
          <Card.Text className="mb-4">
            This first set of questions is a quick diagnostic to help us identify your initial strengths and weaknesses.
          </Card.Text>

          <div className="primer-section">
            <h4 className="primer-subtitle">✔️ Treat it like the real test.</h4>
            <p>Find a quiet space and try to complete all questions in one sitting.</p>
          </div>

          <div className="primer-section">
            <h4 className="primer-subtitle">✏️ Use scratch paper and a pencil.</h4>
            <p>Working through problems on paper is the best way to simulate the real ACT.</p>
          </div>

          <div className="primer-section">
            <h4 className="primer-subtitle">🧮 Have your calculator ready.</h4>
            <p>Use the same calculator you plan to bring on test day.</p>
          </div>

          <hr className="my-4" />

          <div className="primer-section">
            <h4 className="primer-subtitle">How it works:</h4>
            <p>After you answer each question, the timer will stop to show you the solution. Take a moment to review it before moving on to the next problem.</p>
          </div>

          <div className="d-grid gap-2 mt-4">
            <Button variant="primary" size="lg" onClick={handleBeginPractice}>
              Begin First Practice
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PracticePrimer;
