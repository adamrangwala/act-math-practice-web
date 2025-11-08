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
      return res.status(404).send({ message: 'User not found.' });
    }
    const userData = userDoc.data();
    res.status(200).json({
      dailyQuestionLimit: userData?.dailyQuestionLimit || 10,
      role: userData?.role,
      testDate: userData?.testDate,
      currentScore: userData?.currentScore,
      targetScore: userData?.targetScore,
      hasSeenDashboardGuide: userData?.hasSeenDashboardGuide || false,
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
  const { dailyQuestionLimit, role, testDate, currentScore, targetScore } = req.body;

  const updateData: { [key: string]: any } = {};

  if (dailyQuestionLimit !== undefined) {
    updateData.dailyQuestionLimit = dailyQuestionLimit;
  }
  if (role !== undefined) {
    updateData.role = role;
  }
  if (testDate !== undefined) {
    updateData.testDate = testDate;
  }
  if (currentScore !== undefined) {
    updateData.currentScore = currentScore;
  }
  if (targetScore !== undefined) {
    updateData.targetScore = targetScore;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).send({ message: 'No settings provided to update.' });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set(updateData, { merge: true });
    res.status(200).json({ message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const markDashboardGuideSeen = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set({ hasSeenDashboardGuide: true }, { merge: true });
    res.status(200).json({ message: 'Dashboard guide marked as seen.' });
  } catch (error) {
    console.error('Error marking dashboard guide as seen:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

