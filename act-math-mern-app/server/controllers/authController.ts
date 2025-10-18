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
      res.status(201).send({ message: 'User profile created.' });
    } else {
      await userRef.update({ lastActiveAt: new Date() });
      res.status(200).send({ message: 'User profile updated.' });
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
  const { dailyQuestionLimit } = req.body;

  if (typeof dailyQuestionLimit !== 'number' || dailyQuestionLimit < 5) {
    return res.status(400).send({ message: 'Invalid daily question limit.' });
  }

  try {
    const userRef = db.collection('users').doc(req.user.uid);
    await userRef.update({ dailyQuestionLimit });
    res.status(200).send({ message: 'Settings updated successfully.' });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
