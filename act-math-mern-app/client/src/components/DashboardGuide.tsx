import React, { useState } from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import { authenticatedFetch } from '../utils/api';
import './DashboardGuide.css';

import beginPracticeVideo from '../assets/begin_practice_dashboard.mp4';
import skillsAnimationVideo from '../assets/skills_animation.mp4';

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

const steps = [
  {
    title: 'Welcome to Your Dashboard!',
    content: "This is your mission control. Get a high-level view of your progress and decide what to focus on.",
    visual: <Step1SVG />,
  },
  {
    title: 'Start a Daily Practice',
    content: "This is your most important button. Daily sessions contain a random mix of questions, just like the real ACT, and are the best way to improve your stats.",
    visual: (
      <video autoPlay loop muted playsInline width="100%">
        <source src={beginPracticeVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ),
  },
  {
    title: 'Drill Down on Weaknesses',
    content: "After a few sessions, your skills will appear here. Click any skill to start a targeted drill and turn that weakness into a strength.",
    visual: (
      <video autoPlay loop muted playsInline width="100%">
        <source src={skillsAnimationVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ),
  },
];