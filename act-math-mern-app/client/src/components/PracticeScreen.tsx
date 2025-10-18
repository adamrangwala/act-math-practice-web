import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Spinner, ListGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Define the structure of a question object for TypeScript
interface Question {
  questionId: string;
  category: string;
  subcategories: string[];
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  solutionText: string;
  diagramSvg?: string;
}

interface SessionData {
  isCorrect: boolean;
  timeSpent: number;
  subcategories: string[];
}

// Helper function to get ACT-style lettering
const getOptionLetter = (index: number, totalOptions: number) => {
  const letters5alt = ['F', 'G', 'H', 'J', 'K'];
  if (totalOptions === 5) return letters5alt[index];
  return String.fromCharCode(65 + index); // A, B, C...
};

const PracticeScreen = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);

  // State for answer handling
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const handleRestartSession = () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSessionData([]);
    fetchQuestions(true); // Explicitly fetch "practice more" questions
  };

  const fetchQuestions = async (isPracticeMore = false) => {
    if (!currentUser) return;
    setLoading(true);
    const endpoint = isPracticeMore ? '/api/questions/practice-more' : '/api/questions/today';

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch questions.');
      const data = await response.json();
      setQuestions(data);
      startTimeRef.current = Date.now();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(false); // Initial fetch is for daily questions
  }, [currentUser]);

  const submitProgressToServer = async (performanceRating: number, timeSpent: number) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      await fetch('/api/progress/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: questions[currentQuestionIndex].questionId,
          performanceRating,
          timeSpent,
          context: 'practice_session',
        }),
      });
    } catch (err) {
      console.error("Failed to submit progress:", err);
    }
  };

  const handleAnswerSelect = (selectedIndex: number) => {
    if (isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;

    setSessionData(prev => [...prev, {
      isCorrect,
      timeSpent,
      subcategories: currentQuestion.subcategories,
    }]);

    let performanceRating = 0.0;
    if (isCorrect) {
      if (timeSpent <= 60) {
        performanceRating = 1.0;
      } else if (timeSpent <= 180) {
        performanceRating = 1.0 - 0.5 * ((timeSpent - 60) / 120);
      } else {
        performanceRating = 0.5;
      }
    }

    setIsAnswered(true);
    setSelectedAnswerIndex(selectedIndex);
    submitProgressToServer(performanceRating, timeSpent);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      const totalCorrect = sessionData.filter(d => d.isCorrect).length;
      const totalTime = sessionData.reduce((acc, d) => acc + d.timeSpent, 0);
      const sessionStats = {
        accuracy: (totalCorrect / sessionData.length) * 100,
        avgTime: totalTime / sessionData.length,
      };
      navigate('/summary', { state: { sessionStats, practiceQuestions: sessionData } });
      return;
    }

    setIsAnswered(false);
    setSelectedAnswerIndex(null);
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    startTimeRef.current = Date.now();
  };

  const getVariant = (index: number) => {
    if (!isAnswered) return undefined;
    const isCorrect = questions[currentQuestionIndex].correctAnswerIndex === index;
    if (isCorrect) return 'success';
    if (selectedAnswerIndex === index) return 'danger';
    return undefined;
  };

  if (loading) {
    return <Container className="text-center mt-5"><Spinner animation="border" /><p>Loading...</p></Container>;
  }

  if (error) {
    return <Container className="text-center mt-5"><Alert variant="danger">Error: {error}</Alert></Container>;
  }

  if (questions.length === 0 && !loading) {
    return (
      <Container className="text-center mt-5">
        <h2>You've completed your session!</h2>
        <p>Ready for another round?</p>
        <Button variant="primary" size="lg" onClick={handleRestartSession}>
          Practice More
        </Button>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="mt-5">
      <Card>
        <Card.Body>
          <Card.Title>Question {currentQuestionIndex + 1} of {questions.length}</Card.Title>
          <hr />
          {currentQuestion.diagramSvg && (
            <div className="text-center mb-3" dangerouslySetInnerHTML={{ __html: currentQuestion.diagramSvg }} />
          )}
          <Card.Text style={{ fontSize: '1.2rem' }} dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />
          <ListGroup variant="flush">
            {currentQuestion.options.map((option, index) => (
              <ListGroup.Item
                action
                key={index}
                as="button"
                disabled={isAnswered}
                onClick={() => handleAnswerSelect(index)}
                variant={getVariant(index)}
                className="text-start d-flex align-items-center justify-content-start"
              >
                <strong className="me-2" style={{ minWidth: '20px', display: 'inline-block' }}>{getOptionLetter(index, currentQuestion.options.length)}.</strong>
                <span dangerouslySetInnerHTML={{ __html: option }} />
              </ListGroup.Item>
            ))}
          </ListGroup>
          {isAnswered && (
            <Alert variant="info" className="mt-4">
              <strong>Solution:</strong>
              <div dangerouslySetInnerHTML={{ __html: currentQuestion.solutionText }} />
            </Alert>
          )}
        </Card.Body>
        <Card.Footer className="text-end">
          {isAnswered && (
            <Button variant="primary" onClick={handleNextQuestion}>
              {currentQuestionIndex + 1 >= questions.length ? 'Finish Session' : 'Next Question'}
            </Button>
          )}
        </Card.Footer>
      </Card>
    </div>
  );
};

export default PracticeScreen;
