import React, { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import './PracticeScreen.css';
import Calculator from './Calculator';
import { usePracticeTimer } from '../hooks/usePracticeTimer';
import QuestionCard from './QuestionCard';

interface Question {
  questionId: string;
  category: string;
  subcategories: string[];
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  solutionText: string;
  diagramSvg?: string;
  solutionDiagramSvg?: string;
}

interface SessionData {
  isCorrect: boolean;
  timeSpent: number;
  subcategories: string[];
}

const PracticeScreen = () => {
  const { currentUser, isNewUser, setIsNewUser } = useAuth();
  const navigate = useNavigate();
  const { subcategory } = useParams<{ subcategory?: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false); // New state

  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const { timer, pauseTimer, resetTimer } = usePracticeTimer();
  
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!currentUser) return;
      setLoading(true);
      setAllQuestionsCompleted(false);
      
      let endpoint = '/api/questions/today';
      if (subcategory) {
        endpoint = `/api/questions/targeted-practice?subcategory=${encodeURIComponent(subcategory)}`;
      }

      try {
        const data = await authenticatedFetch(endpoint);
        if (data.length === 0 && !subcategory) {
          setAllQuestionsCompleted(true);
        } else {
          setQuestions(data);
        }
        setCurrentQuestionIndex(0);
        setSessionData([]);
        setSelectedAnswerIndex(null);
        setIsFlipped(false);
        setFeedback(null);
        resetTimer();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchQuestions();
    }
  }, [currentUser, subcategory, navigate, resetTimer]);

  const handleAnswerSelect = (selectedIndex: number) => {
    if (isFlipped) return;

    const timeSpent = timer;
    pauseTimer();
    
    const isCorrect = selectedIndex === questions[currentQuestionIndex].correctAnswerIndex;
    
    setSessionData(prev => [...prev, { isCorrect, timeSpent, subcategories: questions[currentQuestionIndex].subcategories }]);
    setSelectedAnswerIndex(selectedIndex);
    setFeedback(isCorrect ? 'Correct!' : 'Incorrect');
    
    let performanceRating = 0.0;
    if (isCorrect) {
      const benchmark = 60;
      performanceRating = timeSpent <= benchmark ? 1.0 : Math.max(0.5, 1.0 - (timeSpent - benchmark) / (benchmark * 2));
    }

    const submitProgress = async () => {
      if (!currentUser) return;
      try {
        await authenticatedFetch('/api/progress/submit', {
          method: 'POST',
          body: JSON.stringify({
            questionId: questions[currentQuestionIndex].questionId,
            performanceRating,
            timeSpent,
            context: subcategory ? 'targeted_practice' : 'practice_session',
            selectedAnswerIndex: selectedIndex,
          }),
        });
      } catch (err) {
        console.error("Failed to submit progress:", err);
      }
    };
    submitProgress();
    
    setIsFlipped(true);
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      // This is the end of the session.
      (async () => {
        let completedSessions = 0;
        try {
          if (!subcategory) {
            const response = await authenticatedFetch('/api/stats/complete-session', { method: 'POST' });
            completedSessions = response.completedSessions; // Capture the count from the API response
            if (isNewUser) {
              setIsNewUser(false);
            }
          }
        } catch (error) {
          console.error("Failed to mark session as complete:", error);
        } finally {
          const totalCorrect = sessionData.filter(d => d.isCorrect).length;
          const totalTime = sessionData.reduce((acc, d) => acc + d.timeSpent, 0);
          const sessionStats = {
            accuracy: (totalCorrect / sessionData.length) * 100,
            avgTime: totalTime / sessionData.length,
            correctCount: totalCorrect,
            totalCount: sessionData.length,
          };
          // Pass the completedSessions count in the navigation state
          navigate('/summary', { state: { sessionStats, practiceQuestions: sessionData, completedSessions } });
        }
      })();
      return;
    }
    
    setIsFlipped(false);
    
    setTimeout(() => {
      setSelectedAnswerIndex(null);
      setCurrentQuestionIndex(nextIndex);
      setFeedback(null);
      resetTimer();
    }, 300);
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="text-center mt-5"><Alert variant="danger">{error}</Alert></Container>;
  
  if (allQuestionsCompleted) {
    return (
      <Container className="text-center mt-5 all-done-container">
        <h2>Great work!</h2>
        <p className="lead">You've answered all available questions for today. Come back tomorrow for more.</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <Container className="text-center mt-5">
        <h2>You've completed your session!</h2>
        <p>There are no more questions available in this category right now.</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <>
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      <button className="calculator-btn-floating" onClick={() => setShowCalculator(true)}>
        🧮
      </button>

      <div className="d-flex justify-content-between align-items-center my-3">
        <div className="timer-widget">
          <span>⏱️</span>
          <span>{timer}s</span>
        </div>
        <div>
          <strong>{questions.length - currentQuestionIndex}</strong> questions left
        </div>
      </div>

      {subcategory && (
        <Alert variant="info" className="mt-3 text-center">
          You're in a targeted practice session for <strong>{decodeURIComponent(subcategory)}</strong>. Progress here won't affect your overall stats.
        </Alert>
      )}

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        isFlipped={isFlipped}
        feedback={feedback}
        selectedAnswerIndex={selectedAnswerIndex}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={handleNextQuestion}
      />
    </>
  );
};

export default PracticeScreen;