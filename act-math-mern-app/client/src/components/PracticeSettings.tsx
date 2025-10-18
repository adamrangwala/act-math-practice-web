import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';

interface PracticeSettingsProps {
  onSave: (limit: number) => void;
  saving: boolean;
}

const PracticeSettings: React.FC<PracticeSettingsProps> = ({ onSave, saving }) => {
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (limit < 5) {
      setError('You must practice at least 5 questions per session.');
      return;
    }
    setError('');
    onSave(limit);
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ width: '30rem' }}>
        <Card.Body>
          <Card.Title className="text-center">Set Your Practice Goal</Card.Title>
          <Card.Text className="text-center text-muted mb-4">
            How many questions would you like to practice per session?
          </Card.Text>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Questions per session (min: 5)</Form.Label>
            <Form.Control
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              min="5"
              placeholder="Enter number of questions"
            />
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Start Practicing'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PracticeSettings;
