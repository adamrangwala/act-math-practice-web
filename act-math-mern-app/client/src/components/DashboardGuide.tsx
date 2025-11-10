import React, { useState } from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import { authenticatedFetch } from '../utils/api';
import './DashboardGuide.css';

// --- SVG Placeholders for each step ---

const steps = [ // Ensure correct video assignment for guide steps
  {
    title: 'Welcome to Your Dashboard!',
    content: "This is your mission control. Get a high-level view of your progress and decide what to focus on.",
    visual: <img src="/dashboard_view.png" alt="Dashboard Overview" style={{ width: '100%', borderRadius: '8px' }} />,
  },
  {
    title: 'Start a Daily Practice',
    content: "This is your most important button. Daily sessions contain a random mix of questions, just like the real ACT, and are the best way to improve your stats.",
    visual: <img src="/begin_daily_practice.png" alt="Animation of clicking the begin practice button" style={{ width: '100%', borderRadius: '8px' }} />,
  },
  {
    title: 'Drill Down on Weaknesses',
    content: "After a few sessions, your skills will appear here. Click any skill to start a targeted drill and turn that weakness into a strength.",
    visual: <img src="/skills_breakdown.png" alt="Animation of clicking a skill card" style={{ width: '100%', borderRadius: '8px' }} />,
  },
];

interface DashboardGuideProps {
  show: boolean;
  onComplete: () => void;
}

export const DashboardGuide: React.FC<DashboardGuideProps> = ({ show, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = async () => {
    try {
      await authenticatedFetch('/api/settings/viewed-dashboard-guide', { method: 'PUT' });
    } catch (error) {
      console.error("Failed to mark dashboard guide as seen:", error);
    } finally {
      onComplete();
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal show={show} onHide={handleComplete} centered backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>{steps[currentStep].title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="guide-visual mb-3">
          {steps[currentStep].visual}
        </div>
        <p className="guide-content">{steps[currentStep].content}</p>
        <ProgressBar now={progress} className="guide-progress mt-4" />
      </Modal.Body>
      <Modal.Footer>
        {currentStep > 0 && <Button variant="outline-secondary" onClick={handlePrev}>Previous</Button>}
        <Button variant="primary" onClick={handleNext}>
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
