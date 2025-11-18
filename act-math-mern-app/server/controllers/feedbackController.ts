import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';

export const submitFeedback = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    const { uid } = req.user;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).send({ message: 'Feedback message cannot be empty.' });
    }

    try {
        const feedbackRef = db.collection('feedback').doc();
        await feedbackRef.set({
            userId: uid,
            message: message.trim(),
            createdAt: new Date(),
            status: 'new', // You can use this status to track feedback (e.g., new, read, archived)
        });

        res.status(201).send({ message: 'Feedback submitted successfully.' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};
