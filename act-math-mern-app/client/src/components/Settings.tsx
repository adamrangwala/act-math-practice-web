import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { authenticatedFetch } from '../utils/api';

// ... (imports)

const Settings = () => {
  // ... (state declarations)

  useEffect(() => {
    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser]);

  const fetchSettings = async () => {
    // No need for the null check here anymore
    try {
      const data = await authenticatedFetch('/api/settings');
      setDailyQuestionLimit(data.dailyQuestionLimit || 10);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleResetProgress = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    setError(null);
    setSuccess(null);
    if (!currentUser) return;

    try {
      await authenticatedFetch('/api/progress/all', {
        method: 'DELETE',
      });
      setSuccess('Your progress has been successfully reset.');
    } catch (err: any) {
      setError(err.message);
    }
    finally {
      setSaving(false);
    }
  };

  // ... (rest of component)
};

export default Settings;
