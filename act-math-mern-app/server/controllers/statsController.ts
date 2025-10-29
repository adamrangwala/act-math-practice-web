import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const statsRef = db.collection('userStats').doc(userId);
    const statsDoc = await statsRef.get();

    if (!statsDoc.exists) {
      // Return a default object for new users who haven't answered any questions yet
      return res.status(200).json({
        practiceStreak: 0,
        totalQuestionsAnswered: 0,
        currentRollingAccuracy: 0,
        previousRollingAccuracy: 0,
        totalPracticeSessions: 0,
      });
    }

    res.status(200).json(statsDoc.data());

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getHeatmapStats = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const progressSnapshot = await db.collection('userSubcategoryProgress').where('userId', '==', userId).get();

    if (progressSnapshot.empty) {
      return res.status(200).json([]);
    }

    const heatmapData = progressSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        subcategory: data.subcategory,
        mastery: data.masteryScore,
      };
    });

    res.status(200).json(heatmapData);

  } catch (error) {
    console.error('Error fetching heatmap stats:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getStreakData = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const progressSnapshot = await db.collection('userSubcategoryProgress').where('userId', '==', userId).get();
    
    if (progressSnapshot.empty) {
      return res.status(200).json({ practiceDays: [] });
    }

    const practiceDates = new Set<string>();
    progressSnapshot.forEach(doc => {
      const progress = doc.data();
      if (progress.lastReviewedAt) {
        // Convert timestamp to YYYY-MM-DD format to count unique days
        practiceDates.add(progress.lastReviewedAt.toDate().toISOString().split('T')[0]);
      }
    });

    res.status(200).json({ practiceDays: Array.from(practiceDates) });

  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getPriorityMatrixStats = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const progressSnapshot = await db.collection('userSubcategoryProgress').where('userId', '==', userId).get();

    if (progressSnapshot.empty) {
      return res.status(200).json([]);
    }

    const matrixData = progressSnapshot.docs.reduce((acc: any[], doc) => {
      const data = doc.data();
      // Only include subcategories where the user has attempted at least 5 questions
      if (data.totalAttempts >= 3) {
        const accuracy = data.totalAttempts > 0 ? (data.correctAttempts / data.totalAttempts) * 100 : 0;
        const avgTime = data.totalAttempts > 0 ? data.totalTimeSpent / data.totalAttempts : 0;
        
        acc.push({
          subcategory: data.subcategory,
          accuracy: parseFloat(accuracy.toFixed(1)),
          avgTime: parseFloat(avgTime.toFixed(1)),
          totalAttempts: data.totalAttempts
        });
      }
      return acc;
    }, []);

    res.status(200).json(matrixData);

  } catch (error) {
    console.error('Error fetching priority matrix stats:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
