import React, { useState } from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import { authenticatedFetch } from '../utils/api';
import './DashboardGuide.css';

// --- SVG Placeholders for each step ---

const Step1SVG = () => (
  <svg width="100%" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="150" rx="8" fill="#F0F2F5"/>
    <rect x="20" y="20" width="240" height="25" rx="4" fill="#E3E8EE"/>
    <rect x="20" y="55" width="75" height="40" rx="4" fill="#D4DAE3"/>
    <rect x="105" y="55" width="70" height="40" rx="4" fill="#D4DAE3"/>
    <rect x="185" y="55" width="75" height="40" rx="4" fill="#D4DAE3"/>
    <rect x="20" y="105" width="240" height="25" rx="4" fill="#C5CED8"/>
  </svg>
);

const Step2SVG = () => (
  <svg width="100%" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="150" rx="8" fill="#F0F2F5"/>
    <rect x="20" y="20" width="240" height="25" rx="4" fill="#E3E8EE"/>
    <rect x="60" y="65" width="160" height="30" rx="15" fill="#6A1B9A" stroke="#C5CED8" strokeWidth="4"/>
    <path d="M140 105 L140 85 L148 90 L132 90 L140 85" fill="#FFFFFF"/>
    <style>{`.cursor { animation: click .8s infinite; } @keyframes click { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }`}</style>
    <path className="cursor" d="M139.998 115.554L136.476 105H143.52L139.998 115.554Z" fill="#000"/>
    <path className="cursor" d="M139.248 106.333L139.998 121L140.748 106.333L139.248 106.333Z" fill="#000"/>
  </svg>
);

const Step3SVG = () => (
  <svg width="100%" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="150" rx="8" fill="#F0F2F5"/>
    <rect x="20" y="20" width="240" height="15" rx="4" fill="#E3E8EE"/>
    <rect x="20" y="45" width="115" height="40" rx="4" fill="#D4DAE3"/>
    <rect x="145" y="45" width="115" height="40" rx="4" fill="#C5CED8" stroke="#6A1B9A" strokeWidth="4"/>
    <rect x="20" y="95" width="115" height="40" rx="4" fill="#D4DAE3"/>
    <rect x="145" y="95" width="115" height="40" rx="4" fill="#D4DAE3"/>
     <style>{`.cursor { animation: click .8s infinite; } @keyframes click { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }`}</style>
    <path className="cursor" d="M192.998 105.554L189.476 95H196.52L192.998 105.554Z" fill="#000"/>
    <path className="cursor" d="M192.248 96.333L192.998 111L193.748 96.333L192.248 96.333Z" fill="#000"/>
  </svg>
);


const steps = [
  {
    title: 'Welcome to Your Dashboard!',
    content: "This is your mission control. Get a high-level view of your progress and decide what to focus on.",
    visual: <Step1SVG />,
  },
  {
    title: 'Start a Daily Practice',
    content: "This is your most important button. Daily sessions contain a random mix of questions, just like the real ACT, and are the best way to improve your stats.",
    visual: <Step2SVG />,
  },
  {
    title: 'Drill Down on Weaknesses',
    content: "After a few sessions, your skills will appear here. Click any skill to start a targeted drill and turn that weakness into a strength.",
    visual: <Step3SVG />,
  },
];

interface DashboardGuideProps {
  show: boolean;
  onComplete: () => void;
}

const DashboardGuide: React.FC<DashboardGuideProps> = ({ show, onComplete }) => {
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
      // We still mark this permanently. The user can re-trigger from a settings menu later if needed.
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

export default DashboardGuide;