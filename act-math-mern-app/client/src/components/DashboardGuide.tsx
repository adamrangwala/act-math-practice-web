import React, { useState, useEffect } from 'react';
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
    content: "This is your most important button. Complete one Daily Practice session every day to build your streak. These sessions are random, just like the real ACT. Only these practice sessions will affect your stats!",
    position: 'bottom',
  },
  {
    targetSelector: '.skills-list',
    title: 'Target Your Weaknesses',
    content: "After a few practice sessions, your skills will appear here. Click any card to start a targeted drill and improve that specific topic.",
    position: 'top',
  },
];

interface DashboardGuideProps {
  onComplete: () => void;
}

const DashboardGuide: React.FC<DashboardGuideProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const findTarget = () => {
      const currentStepData = steps[currentStep];
      const targetElement = document.querySelector(currentStepData.targetSelector);
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      } else {
        // Retry if the element isn't found yet
        setTimeout(findTarget, 100);
      }
    };
    findTarget();
  }, [currentStep]);

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

  if (!targetRect) return null;

  const currentStepData = steps[currentStep];
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    top: targetRect.bottom + 10, // Default to bottom
    left: targetRect.left + targetRect.width / 2,
    transform: 'translateX(-50%)',
    zIndex: 1001,
  };

  // Adjust position based on step data
  if (currentStepData.position === 'top') {
    tooltipStyle.top = targetRect.top - 10;
    tooltipStyle.transform = 'translate(-50%, -100%)';
  }

  return (
    <div className="dashboard-guide-overlay">
      <div className="spotlight" style={{ top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height }}></div>
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
