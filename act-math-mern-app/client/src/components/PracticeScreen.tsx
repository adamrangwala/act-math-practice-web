import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Spinner, ListGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  const fetchQuestions = async (isPracticeMore = false) => {
    if (!currentUser) return;
    setLoading(true);
    const endpoint = isPracticeMore ? '/api/questions/practice-more' : `/api/questions/today?limit=10`;
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });
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

  useEffect(() => { fetchQuestions(false); }, [currentUser]);

  useEffect(() => {
    // This effect ensures the container has the correct height before any interaction.
    const setInitialHeight = () => {
      if (frontRef.current && !isFlipped) {
        setCardHeight(frontRef.current.scrollHeight);
      }
    };
    // A small timeout allows the content to render fully before we measure it.
    const timer = setTimeout(setInitialHeight, 100);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = (selectedIndex: number) => {
    if (isFlipped) return;
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    const isCorrect = selectedIndex === questions[currentQuestionIndex].correctAnswerIndex;
    
    setSessionData(prev => [...prev, { isCorrect, timeSpent, subcategories: questions[currentQuestionIndex].subcategories }]);
    setSelectedAnswerIndex(selectedIndex);
    
    // Before flipping, calculate the max height of the front and back to ensure the container expands smoothly.
    const frontHeight = frontRef.current?.scrollHeight || 0;
    const backHeight = backRef.current?.scrollHeight || 0;
    setCardHeight(Math.max(frontHeight, backHeight));
    
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
      };
      navigate('/summary', { state: { sessionStats, practiceQuestions: sessionData } });
      return;
    }
    
    setIsFlipped(false);
    
    setTimeout(() => {
      setSelectedAnswerIndex(null);
      setCurrentQuestionIndex(nextIndex);
      startTimeRef.current = Date.now();
    }, 300); // Wait for flip-back animation to mostly complete.
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
        <Button variant="primary" size="lg" onClick={() => fetchQuestions(true)}>Practice More</Button>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className={`flip-card-container mt-4 ${isFlipped ? 'is-flipped' : ''}`} style={{ minHeight: cardHeight }}>
      <div className="flip-card-inner">
        {/* Card Front */}
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

        {/* Card Back */}
        <div className="flip-card-back" ref={backRef}>
          <Card>
            <Card.Body>
              <Card.Title>Solution for Question {currentQuestionIndex + 1}</Card.Title>
              <hr />
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
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;
