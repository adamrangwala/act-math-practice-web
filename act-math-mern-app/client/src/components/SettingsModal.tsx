import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface SettingsModalProps {
  show: boolean;
  handleClose: () => void;
  currentLimit: number;
  onSave: (newLimit: number) => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, handleClose, currentLimit, onSave }) => {
  const [limit, setLimit] = useState(currentLimit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (limit < 5) {
      setError('Practice sessions must have at least 5 questions.');
      return;
    }
    setError('');
    setSaving(true);
    await onSave(limit);
    setSaving(false);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group>
          <Form.Label>Questions per Practice Session</Form.Label>
          <Form.Control
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            min="5"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
