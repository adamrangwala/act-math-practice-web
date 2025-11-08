import React, { useRef, useEffect, useState } from 'react';
import { Card, ListGroup, Button, Alert } from 'react-bootstrap';
import './QuestionCard.css';

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

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  isFlipped: boolean;
  feedback: string | null;
  selectedAnswerIndex: number | null;
  onAnswerSelect: (index: number) => void;
  onNextQuestion: () => void;
}

const getOptionLetter = (index: number) => ['F', 'G', 'H', 'J', 'K'][index];

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  isFlipped,
  feedback,
  selectedAnswerIndex,
  onAnswerSelect,
  onNextQuestion,
}) => {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  }, [isFlipped, question]);

  useEffect(() => {
    const calculateHeight = () => {
      const frontHeight = frontRef.current?.scrollHeight || 0;
      const backHeight = backRef.current?.scrollHeight || 0;
      setCardHeight(isFlipped ? backHeight : frontHeight);
    };
    
    // Delay calculation to allow MathJax to render
    const timer = setTimeout(calculateHeight, 50);
    return () => clearTimeout(timer);
  }, [question, isFlipped]);

  const getVariant = (index: number) => {
    if (!isFlipped) return undefined;
    if (question.correctAnswerIndex === index) return 'success';
    if (selectedAnswerIndex === index) return 'danger';
    return 'light';
  };

  return (
    <div className={`flip-card-container mt-4 ${isFlipped ? 'is-flipped' : ''}`} style={{ minHeight: cardHeight }}>
      {feedback === 'Correct!' && (
        <div className="feedback-container">
          <div className="feedback-text pop">Correct!</div>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="flip-card-inner">
        <div className="flip-card-front" ref={frontRef}>
          <Card>
            <Card.Body>
              <Card.Title>Question {questionNumber} of {totalQuestions}</Card.Title>
              <hr />
              {question.diagramSvg && <div className="text-center mb-3" dangerouslySetInnerHTML={{ __html: question.diagramSvg }} />}
              <Card.Text style={{ fontSize: '1.2rem' }} dangerouslySetInnerHTML={{ __html: question.questionText }} />
              <ListGroup variant="flush">
                {question.options.map((option, index) => (
                  <ListGroup.Item action key={index} as="button" onClick={() => onAnswerSelect(index)} className="text-start d-flex align-items-baseline">
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
              <Card.Title>Solution for Question {questionNumber}</Card.Title>
              <hr />
              {question.diagramSvg && <div className="text-center mb-3" dangerouslySetInnerHTML={{ __html: question.diagramSvg }} />}
              <Card.Text style={{ fontSize: '1.2rem' }} dangerouslySetInnerHTML={{ __html: question.questionText }} />
              <ListGroup variant="flush">
                {question.options.map((option, index) => (
                  <ListGroup.Item key={index} variant={getVariant(index)} className="text-start d-flex align-items-baseline">
                    <strong className="me-2" style={{ minWidth: '25px' }}>{getOptionLetter(index)}.</strong>
                    <span dangerouslySetInnerHTML={{ __html: option }} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Alert variant="info" className="mt-4">
                <strong>Solution:</strong>
                <div dangerouslySetInnerHTML={{ __html: question.solutionText }} />
                {question.solutionDiagramSvg && <div className="text-center mt-3" dangerouslySetInnerHTML={{ __html: question.solutionDiagramSvg }} />}
              </Alert>
              <div className="text-end">
                <Button variant="primary" onClick={onNextQuestion}>
                  {questionNumber >= totalQuestions ? 'Finish Session' : 'Next Question'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
