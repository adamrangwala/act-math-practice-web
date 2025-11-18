import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { authenticatedFetch } from '../utils/api';

interface FeedbackModalProps {
  show: boolean;
  onClose: () => void;
}

const FEEDBACK_CATEGORIES = [
  'Bug/Error',
  'Feature Request',
  'User Experience',
  'Performance',
  'Other',
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ show, onClose }) => {
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState(''); // New state for category
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (feedbackCategory.trim().length === 0) {
      setError('Please select a feedback category.');
      setLoading(false);
      return;
    }

    if (feedbackMessage.trim().length === 0) {
      setError('Feedback message cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      await authenticatedFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ message: feedbackMessage, category: feedbackCategory }), // Include category
      });
      setSuccess('Thank you for your feedback!');
      setFeedbackMessage(''); // Clear the form
      setFeedbackCategory(''); // Clear the category
      setTimeout(() => {
        onClose(); // Close modal after a short delay
      }, 1500);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFeedbackMessage('');
    setFeedbackCategory(''); // Clear category on close
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Submit Feedback</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form.Group controlId="feedbackCategory" className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={feedbackCategory}
            onChange={(e) => setFeedbackCategory(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a category</option>
            {FEEDBACK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="feedbackMessage">
          <Form.Label>What's on your mind? We'd love to hear it!</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            placeholder="Enter your feedback here..."
            disabled={loading}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading || feedbackMessage.trim().length === 0 || feedbackCategory.trim().length === 0}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Submit Feedback'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FeedbackModal;
