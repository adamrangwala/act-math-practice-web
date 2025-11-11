import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
    user?: DecodedIdToken;
}

export const initUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const { uid, email, name } = req.user;
    const { role, testDate, currentScore, targetScore } = req.body;

    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            // User exists, check if it's a legacy user needing a role
            const userData = userDoc.data();
            if (!userData?.role) {
                const statsRef = db.collection('userStats').doc(uid);
                const statsDoc = await statsRef.get();
                if (statsDoc.exists) {
                    // This is a legacy user, assign default role and bypass onboarding
                    await userRef.set({ role: 'self-studier' }, { merge: true });
                    return res.status(200).json({ isNewUser: false });
                }
            }
            return res.status(200).json({ isNewUser: false });
        } else {
            // New user, create documents
            const newUser = {
                email,
                name,
                createdAt: new Date(),
                role,
                testDate: testDate || null,
                currentScore: currentScore || null,
                targetScore: targetScore || null,
            };
            await userRef.set(newUser);

            // Initialize stats
            const statsRef = db.collection('userStats').doc(uid);
            await statsRef.set({
                totalCorrect: 0,
                totalIncorrect: 0,
                totalTimeSpent: 0,
                completedSessions: 0,
                practiceStreak: 0,
                lastSessionCompleted: null,
            });

            return res.status(201).json({ isNewUser: true });
        }
    } catch (error) {
        console.error('Error initializing user:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const { uid } = req.user;

    try {
        // Firestore collections to delete from
        const collections = ['users', 'userStats', 'userSubcategoryProgress'];
        const batch = db.batch();

        for (const collection of collections) {
            const docRef = db.collection(collection).doc(uid);
            batch.delete(docRef);
        }

        await batch.commit();

        // Now delete the user from Firebase Authentication
        await auth.deleteUser(uid);

        res.status(200).json({ message: 'User account deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
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