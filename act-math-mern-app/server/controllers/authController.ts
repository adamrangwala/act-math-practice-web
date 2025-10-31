import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';

// Extend the Express Request interface to include the user property
export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const initUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const { uid, email, name, picture } = req.user;

  try {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        email,
        displayName: name,
        photoURL: picture,
        dailyQuestionLimit: 10, // Default value
        createdAt: new Date(),
        lastActiveAt: new Date(),
      });
      res.status(201).json({ message: 'User profile created.', isNewUser: true });
    } else {
      // Existing user
      const userData = doc.data();
      if (!userData?.role) {
        // Role is missing. Differentiate between a legacy user and a reset user.
        const statsRef = db.collection('userStats').doc(uid);
        const statsDoc = await statsRef.get();

        if (statsDoc.exists) {
          // Legacy user: They have stats but no role. Silently migrate them.
          await userRef.update({ role: 'hs_student', lastActiveAt: new Date() });
          res.status(200).json({ message: 'User profile migrated and updated.', isNewUser: false });
        } else {
          // Reset user: They have no stats and no role. Send to onboarding.
          res.status(200).json({ message: 'User requires onboarding.', isNewUser: true });
        }
      } else {
        // Normal login for an existing, onboarded user
        await userRef.update({ lastActiveAt: new Date() });
        res.status(200).json({ message: 'User profile updated.', isNewUser: false });
      }
    }
  } catch (error) {
    console.error('Error initializing user:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getUserSettings = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).send({ message: 'User not found' });
    }
    const data = doc.data();
    // Ensure we send a plain object, not a complex Firestore type
    res.status(200).json({ 
      dailyQuestionLimit: data?.dailyQuestionLimit,
      displayName: data?.displayName,
      email: data?.email,
    });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const updateUserSettings = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;
  const { dailyQuestionLimit, role, testDate, currentScore, targetScore } = req.body;

  const updateData: { [key: string]: any } = {};

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

  if (testDate !== undefined) {
    if (testDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(testDate)) {
      return res.status(400).send({ message: 'Invalid test date format.' });
    }
    updateData.testDate = testDate;
  }

  if (currentScore !== undefined) {
    if (typeof currentScore !== 'number' || currentScore < 1 || currentScore > 36) {
      return res.status(400).send({ message: 'Invalid current score.' });
    }
    updateData.currentScore = currentScore;
  }

  if (targetScore !== undefined) {
    if (typeof targetScore !== 'number' || targetScore < 1 || targetScore > 36) {
      return res.status(400).send({ message: 'Invalid target score.' });
    }
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
