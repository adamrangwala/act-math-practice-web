import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';

const Settings = () => {
  const { currentUser, setIsNewUser } = useAuth();
  const navigate = useNavigate();
  const [dailyQuestionLimit, setDailyQuestionLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await authenticatedFetch('/api/settings');
        setDailyQuestionLimit(data.dailyQuestionLimit || 10);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    if (!currentUser) return;

    try {
      await authenticatedFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ dailyQuestionLimit }),
      });
      setSuccess('Settings saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    setError(null);
    setSuccess(null);
    if (!currentUser) return;

    try {
      // This will be the new endpoint
      await authenticatedFetch('/api/user', {
        method: 'DELETE',
      });
      // Log the user out on the client-side after successful deletion
      await currentUser.getIdToken(true); // Force refresh token
      await currentUser.delete();
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  }

  return (
    <>
      <div className="mt-4">
        <Card>
          <Card.Body>
            <Card.Title as="h2">Settings</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSave}>
              <Form.Group className="mb-3" controlId="dailyQuestionLimit">
                <Form.Label>Daily Question Limit</Form.Label>
                <Form.Control
                  type="number"
                  value={dailyQuestionLimit}
                  onChange={(e) => setDailyQuestionLimit(parseInt(e.target.value, 10))}
                  min="5"
                  max="50"
                  required
                />
                <Form.Text className="text-muted">
                  Choose how many questions you want in your daily practice session (5-50).
                </Form.Text>
              </Form.Group>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? <Spinner as="span" animation="border" size="sm" /> : 'Save Settings'}
              </Button>
            </Form>
            <hr />
            <div className="mt-4">
              <h4>Danger Zone</h4>
              <p>This action is irreversible. It will permanently delete your account and all associated data.</p>
              <Button variant="danger" onClick={() => setShowConfirmModal(true)}>
                Delete My Account
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Are you absolutely sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will permanently delete your account, including all practice history and stats. This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Yes, Delete My Account
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Settings;
