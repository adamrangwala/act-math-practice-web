import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';

export const getSettings = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      // This case should ideally not happen if user is initialized at login
      return res.status(404).send({ message: 'User not found.' });
    }
    const userData = userDoc.data();
    res.status(200).json({
      dailyQuestionLimit: userData?.dailyQuestionLimit || 10,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;
  const { dailyQuestionLimit, role } = req.body;

  const updateData: { dailyQuestionLimit?: number; role?: string } = {};

  if (dailyQuestionLimit !== undefined) {
    if (typeof dailyQuestionLimit !== 'number' || dailyQuestionLimit < 5 || dailyQuestionLimit > 50) {
      return res.status(400).send({ message: 'Invalid daily question limit.' });
    }
    updateData.dailyQuestionLimit = dailyQuestionLimit;
  }

  if (role !== undefined) {
    const allowedRoles = ['ms_student', 'hs_student', 'teacher', 'other'];
    if (typeof role !== 'string' || !allowedRoles.includes(role)) {
      return res.status(400).send({ message: 'Invalid role specified.' });
    }
    updateData.role = role;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).send({ message: 'No settings provided to update.' });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set(updateData, { merge: true }); // Use set with merge to create/update
    res.status(200).json({ message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
