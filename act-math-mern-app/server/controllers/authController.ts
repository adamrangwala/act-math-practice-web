import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
    user?: DecodedIdToken;
}

// Simplified initUser function
export const initUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const { uid, email, name } = req.user;

    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            // If the document exists, the user is not new.
            return res.status(200).json({ isNewUser: false });
        } else {
            // New user, create a basic document. Onboarding data will be added later.
            const newUser = {
                email,
                name,
                createdAt: new Date(),
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

// New function to handle onboarding data
export const completeOnboarding = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const { uid } = req.user;
    const { dailyQuestionLimit, role, testDate, currentScore, targetScore } = req.body;

    try {
        const userRef = db.collection('users').doc(uid);
        const updateData: { [key: string]: any } = {
            dailyQuestionLimit,
            role,
            testDate: testDate || null,
            currentScore: currentScore || null,
            targetScore: targetScore || null,
        };

        await userRef.set(updateData, { merge: true });

        res.status(200).json({ message: 'Onboarding completed successfully.' });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const { uid } = req.user;

    try {
        const collections = ['users', 'userStats', 'userSubcategoryProgress'];
        const batch = db.batch();
        for (const collection of collections) {
            const docRef = db.collection(collection).doc(uid);
            batch.delete(docRef);
        }
        await batch.commit();
        await auth.deleteUser(uid);
        res.status(200).json({ message: 'User account deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};
