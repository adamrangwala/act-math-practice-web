import React, { useState } from 'react';
import { authenticatedFetch } from '../utils/api';
import './DashboardGuide.css';

interface TooltipStep {
  targetSelector: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const steps: TooltipStep[] = [
  {
    targetSelector: '.stats-cards',
    title: 'Your Mission Control',
    content: "This is your mission control. Your Rolling Accuracy shows your recent performance, and the Priority Matrix gives you a big-picture view of your skills.",
    position: 'bottom',
  },
  {
    targetSelector: '.practice-button',
    title: 'Your Daily Workout',
    content: "This is your most important button. Complete one Daily Practice session every day to build your streak. These sessions are random, just like the real ACT.",
    position: 'bottom',
  },
  {
    targetSelector: '.skills-list',
    title: 'Target Your Weaknesses',
    content: "After a few sessions, your skills will appear here. Click any card to start a targeted drill and improve that specific topic.",
    position: 'top',
  },
];

interface DashboardGuideProps {
  onComplete: () => void;
}

const DashboardGuide: React.FC<DashboardGuideProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
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

  const currentStepData = steps[currentStep];
  const targetElement = document.querySelector(currentStepData.targetSelector);
  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    top: rect.bottom + 10, // Default to bottom
    left: rect.left + rect.width / 2,
    transform: 'translateX(-50%)',
    zIndex: 1001,
  };

  // Adjust position based on step data
  if (currentStepData.position === 'top') {
    tooltipStyle.top = rect.top - 10;
    tooltipStyle.transform = 'translate(-50%, -100%)';
  }

  return (
    <div className="dashboard-guide-overlay">
      <div className="spotlight" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}></div>
      <div className="tooltip-box" style={tooltipStyle}>
        <h4>{currentStepData.title}</h4>
        <p>{currentStepData.content}</p>
        <button onClick={handleNext}>
          {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default DashboardGuide;
