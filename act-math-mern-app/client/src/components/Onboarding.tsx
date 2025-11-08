import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch } from '../utils/api';
import './Onboarding.css';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [testDate, setTestDate] = useState('');
  const [currentScore, setCurrentScore] = useState('');
  const [targetScore, setTargetScore] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const { setIsNewUser } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    if (selectedRole === 'ms_student' || selectedRole === 'hs_student') {
      setStep(2); // Go to Date Picker
    } else {
      setStep(3); // Skip Date Picker and go to Scores
    }
  };

  const handleDateContinue = () => {
    setStep(3);
  };

  const validateScores = () => {
    const current = currentScore ? parseInt(currentScore, 10) : 0;
    const target = targetScore ? parseInt(targetScore, 10) : 0;

    if ((currentScore && (current < 1 || current > 36)) || (targetScore && (target < 1 || target > 36))) {
      setScoreError('Please enter scores between 1 and 36.');
      return false;
    }
    setScoreError('');
    return true;
  };

  const handleScoresContinue = () => {
    if (validateScores()) {
      setStep(4);
    }
  };

  const handleCurrentScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentScore(e.target.value);
    if (scoreError) {
      validateScores();
    }
  };

  const handleTargetScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetScore(e.target.value);
    if (scoreError) {
      validateScores();
    }
  };

  const isScoresStepValid = useMemo(() => {
    const current = currentScore ? parseInt(currentScore, 10) : 0;
    const target = targetScore ? parseInt(targetScore, 10) : 0;
    return (!currentScore || (current >= 1 && current <= 36)) && (!targetScore || (target >= 1 && target <= 36));
  }, [currentScore, targetScore]);


  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authenticatedFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ 
          dailyQuestionLimit: limit, 
          role: role, 
          testDate: testDate,
          currentScore: currentScore ? parseInt(currentScore, 10) : undefined,
          targetScore: targetScore ? parseInt(targetScore, 10) : undefined,
        }),
      });
      
      if (setIsNewUser) {
        setIsNewUser(false);
      }
      navigate('/practice');
    } catch (error) {
      console.error("Failed to save settings:", error);
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {step === 1 && (
          <>
            <h1>Welcome to ACT Math Sprint!</h1>
            <p>To help personalize your experience, please select the option that best describes you.</p>
            <div className="role-selection-container">
              <button onClick={() => handleRoleSelect('ms_student')} className="role-button">I am a Middle School Student</button>
              <button onClick={() => handleRoleSelect('hs_student')} className="role-button">I am a High School Student</button>
              <button onClick={() => handleRoleSelect('teacher')} className="role-button">I am a Teacher or Tutor</button>
              <button onClick={() => handleRoleSelect('other')} className="role-button">Other</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>When is your test date?</h1>
            <p>Knowing your test date helps us tailor your practice schedule. You can skip this for now.</p>
            <div className="date-picker-container">
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="date-picker"
              />
            </div>
            <button onClick={handleDateContinue} className="continue-button">
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1>What are your score goals? (Optional)</h1>
            <p>If you know your current and target ACT Math scores, we can help track your progress.</p>
            <div className="score-inputs-container">
              <div className="score-input-group">
                <label htmlFor="current-score">Current Score</label>
                <input
                  type="number"
                  id="current-score"
                  min="1"
                  max="36"
                  value={currentScore}
                  onChange={handleCurrentScoreChange}
                  onBlur={validateScores}
                  placeholder="e.g., 22"
                />
              </div>
              <div className="score-input-group">
                <label htmlFor="target-score">Target Score</label>
                <input
                  type="number"
                  id="target-score"
                  min="1"
                  max="36"
                  value={targetScore}
                  onChange={handleTargetScoreChange}
                  onBlur={validateScores}
                  placeholder="e.g., 28"
                />
              </div>
            </div>
            {scoreError && <p className="error-message">{scoreError}</p>}
            <button onClick={handleScoresContinue} disabled={!isScoresStepValid} className="continue-button">
              Continue
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h1>Set Your Daily Goal</h1>
            <p>Set a goal for how many questions you'd like to practice in each daily session.</p>
            
            <div className="slider-container">
              <label htmlFor="question-limit-slider">Daily Questions: <strong>{limit}</strong></label>
              <input
                type="range"
                id="question-limit-slider"
                min="5"
                max="25"
                step="5"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>5</span>
                <span>25</span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="continue-button">
              {loading ? 'Saving...' : 'Start Practicing'}
            </button>
          </>
        )}
      </div>
    </div>
  );

};

export default Onboarding;
