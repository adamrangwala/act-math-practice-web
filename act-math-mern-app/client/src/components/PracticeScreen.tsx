import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Spinner, ListGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';

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

const getOptionLetter = (index: number) => ['F', 'G', 'H', 'J', 'K'][index];

const PracticeScreen = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { subcategory } = useParams<{ subcategory?: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!currentUser) return;
      setLoading(true);
      
      let endpoint = '/api/questions/today';
      if (subcategory) {
        endpoint = `/api/questions/targeted-practice?subcategory=${encodeURIComponent(subcategory)}`;
      }

      try {
        const data = await authenticatedFetch(endpoint);
        setQuestions(data);
        // Reset session-specific state when new questions are loaded
        setCurrentQuestionIndex(0);
        setSessionData([]);
        setSelectedAnswerIndex(null);
        setIsFlipped(false);
        startTimeRef.current = Date.now();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchQuestions();
    }
  }, [currentUser, subcategory, navigate]); // Added navigate to dependency array

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  }, [currentQuestionIndex, isFlipped, questions]); // Added questions to dependency array

  useEffect(() => {
    const calculateHeight = () => {
      const frontHeight = frontRef.current?.scrollHeight || 0;
      const backHeight = backRef.current?.scrollHeight || 0;
      
      if (isFlipped) {
        setCardHeight(backHeight > 0 ? backHeight : undefined);
      } else {
        setCardHeight(frontHeight > 0 ? frontHeight : undefined);
      }
    };
    
    // Calculate height after a short delay to allow for rendering
    const timer = setTimeout(calculateHeight, 50);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, questions, isFlipped]);

  const handleAnswerSelect = (selectedIndex: number) => {
    if (isFlipped) return;
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    const isCorrect = selectedIndex === questions[currentQuestionIndex].correctAnswerIndex;
    
    setSessionData(prev => [...prev, { isCorrect, timeSpent, subcategories: questions[currentQuestionIndex].subcategories }]);
    setSelectedAnswerIndex(selectedIndex);
    
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
      const totalCorrect = sessionData.filter(d => d.isCorrect).length;
      const totalTime = sessionData.reduce((acc, d) => acc + d.timeSpent, 0);
      const sessionStats = {
        accuracy: (totalCorrect / sessionData.length) * 100,
        avgTime: totalTime / sessionData.length,
        correctCount: totalCorrect,
        totalCount: sessionData.length,
      };
      navigate('/summary', { state: { sessionStats, practiceQuestions: sessionData } });
      return;
    }
    
    setIsFlipped(false);
    
    setTimeout(() => {
      setSelectedAnswerIndex(null);
      setCurrentQuestionIndex(nextIndex);
      startTimeRef.current = Date.now();
    }, 300); // Delay matches the flip animation
  };

  const getVariant = (index: number) => {
    if (!isFlipped) return undefined;
    const isCorrect = questions[currentQuestionIndex].correctAnswerIndex === index;
    if (isCorrect) return 'success';
    if (selectedAnswerIndex === index) return 'danger';
    return 'light';
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="text-center mt-5"><Alert variant="danger">{error}</Alert></Container>;
  
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
      {subcategory && (
        <Alert variant="info" className="mt-3 text-center">
          You're in a targeted practice session for <strong>{decodeURIComponent(subcategory)}</strong>. Progress here won't affect your overall stats.
        </Alert>
      )}
      <div className={`flip-card-container mt-4 ${isFlipped ? 'is-flipped' : ''}`} style={{ minHeight: cardHeight }}>
        <div className="flip-card-inner">
          <div className="flip-card-front" ref={frontRef}>
            <Card>
              <Card.Body>
                <Card.Title>Question {currentQuestionIndex + 1} of {questions.length}</Card.Title>
                <hr />
                {currentQuestion.diagramSvg && <div className="text-center mb-3" dangerouslySetInnerHTML={{ __html: currentQuestion.diagramSvg }} />}
                <Card.Text style={{ fontSize: '1.2rem' }} dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />
                <ListGroup variant="flush">
                  {currentQuestion.options.map((option, index) => (
                    <ListGroup.Item action key={index} as="button" onClick={() => handleAnswerSelect(index)} className="text-start d-flex align-items-baseline">
                      <strong className="me-2" style={{ minWidth: '25px' }}>{getOptionLetter(index)}.</strong>
                      <span dangerouslySetInnerHTML={{ __html: option }} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
          <div className="flip-card-back" ref={backRef}>
            <Card>
              <Card.Body>
                <Card.Title>Solution for Question {currentQuestionIndex + 1}</Card.Title>
                <hr />
                {currentQuestion.diagramSvg && <div className="text-center mb-3" dangerouslySetInnerHTML={{ __html: currentQuestion.diagramSvg }} />}
                <Card.Text style={{ fontSize: '1.2rem' }} dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />
                <ListGroup variant="flush">
                  {currentQuestion.options.map((option, index) => (
                    <ListGroup.Item key={index} variant={getVariant(index)} className="text-start d-flex align-items-baseline">
                      <strong className="me-2" style={{ minWidth: '25px' }}>{getOptionLetter(index)}.</strong>
                      <span dangerouslySetInnerHTML={{ __html: option }} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Alert variant="info" className="mt-4">
                  <strong>Solution:</strong>
                  <div dangerouslySetInnerHTML={{ __html: currentQuestion.solutionText }} />
                  {currentQuestion.solutionDiagramSvg && <div className="text-center mt-3" dangerouslySetInnerHTML={{ __html: currentQuestion.solutionDiagramSvg }} />}
                </Alert>
                <div className="text-end">
                  <Button variant="primary" onClick={handleNextQuestion}>
                    {currentQuestionIndex + 1 >= questions.length ? 'Finish Session' : 'Next Question'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PracticeScreen;
