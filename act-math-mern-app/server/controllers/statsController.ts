import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const progressSnapshot = await db.collection('userSubcategoryProgress').where('userId', '==', userId).get();

    if (progressSnapshot.empty) {
      return res.status(200).json({
        questionsDue: 0,
        subcategoriesMastered: 0,
        overallAccuracy: 0,
        totalSubcategoriesTracked: 0,
      });
    }

    let totalAttempts = 0;
    let correctAttempts = 0;
    let questionsDue = 0;
    let subcategoriesMastered = 0;
    const now = new Date();

    progressSnapshot.forEach(doc => {
      const progress = doc.data();
      totalAttempts += progress.totalAttempts || 0;
      correctAttempts += progress.correctAttempts || 0;

      if (progress.nextReviewDate.toDate() <= now) {
        questionsDue++;
      }
      if (progress.masteryScore >= 0.9) { // Mastery threshold
        subcategoriesMastered++;
      }
    });

    const overallAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    res.status(200).json({
      questionsDue,
      subcategoriesMastered,
      overallAccuracy: parseFloat(overallAccuracy.toFixed(2)),
      totalSubcategoriesTracked: progressSnapshot.size,
    });

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

    const matrixData = progressSnapshot.docs.map(doc => {
      const data = doc.data();
      const accuracy = data.totalAttempts > 0 ? (data.correctAttempts / data.totalAttempts) * 100 : 0;
      const avgTime = data.totalAttempts > 0 ? data.totalTimeSpent / data.totalAttempts : 0;
      
      return {
        subcategory: data.subcategory,
        accuracy: parseFloat(accuracy.toFixed(1)),
        avgTime: parseFloat(avgTime.toFixed(1))
      };
    });

    res.status(200).json(matrixData);

  } catch (error) {
    console.error('Error fetching priority matrix stats:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
