import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';

const VALID_FEEDBACK_CATEGORIES = [
  'Bug/Error',
  'Feature Request',
  'User Experience',
  'Performance',
  'Other',
];

export const submitFeedback = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    const { uid } = req.user;
    const { message, category } = req.body; // Destructure category

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).send({ message: 'Feedback message cannot be empty.' });
    }

    if (!category || typeof category !== 'string' || !VALID_FEEDBACK_CATEGORIES.includes(category)) {
        return res.status(400).send({ message: 'Invalid feedback category provided.' });
    }

    try {
        const feedbackRef = db.collection('feedback').doc();
        await feedbackRef.set({
            userId: uid,
            message: message.trim(),
            category: category, // Store the category
            createdAt: new Date(),
            status: 'new',
        });

        res.status(201).send({ message: 'Feedback submitted successfully.' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};
