import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';
import { FieldValue } from 'firebase-admin/firestore';

interface ProgressSubmission {
  questionId: string;
  performanceRating: number; // 0.0 to 1.0
  timeSpent: number; // in seconds
  context: 'practice_session' | 'targeted_practice' | 'mock_test';
}

export const submitProgress = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const { questionId, performanceRating, timeSpent, context }: ProgressSubmission = req.body;
  const userId = req.user.uid;

  if (!questionId || performanceRating === undefined || !context || timeSpent === undefined) {
    return res.status(400).send({ message: 'Missing required progress data.' });
  }

  try {
    const questionRef = db.collection('questions').doc(questionId);
    const questionDoc = await questionRef.get();
    if (!questionDoc.exists) {
      return res.status(404).send({ message: 'Question not found.' });
    }
    const subcategories = questionDoc.data()?.subcategories || [];

    const isCorrect = performanceRating > 0;

    // Step 1: Update User's Personal Subcategory Progress (always)
    for (const subcategory of subcategories) {
      const progressId = `${userId}_${subcategory.replace(/\s+/g, '-')}`;
      const progressRef = db.collection('userSubcategoryProgress').doc(progressId);
      const progressDoc = await progressRef.get();

      if (progressDoc.exists) {
        const currentProgress = progressDoc.data()!;
        const newMasteryScore = calculateNewMastery(currentProgress.masteryScore, performanceRating);
        
        await progressRef.update({
          masteryScore: newMasteryScore,
          lastReviewedAt: FieldValue.serverTimestamp(),
          nextReviewDate: calculateNextReviewDate(newMasteryScore),
          totalAttempts: FieldValue.increment(1),
          correctAttempts: FieldValue.increment(isCorrect ? 1 : 0),
          totalTimeSpent: FieldValue.increment(timeSpent),
        });
      } else {
        const newMasteryScore = calculateNewMastery(0.1, performanceRating);
        await progressRef.set({
          userId,
          subcategory,
          masteryScore: newMasteryScore,
          lastReviewedAt: FieldValue.serverTimestamp(),
          nextReviewDate: calculateNextReviewDate(newMasteryScore),
          totalAttempts: 1,
          correctAttempts: isCorrect ? 1 : 0,
          totalTimeSpent: timeSpent,
        });
      }
    }

    // Step 2: Update Global Question Stats (conditionally)
    if (context === 'practice_session' || context === 'mock_test') {
      await questionRef.update({
        globalTotalAttempts: FieldValue.increment(1),
        globalCorrectAttempts: FieldValue.increment(isCorrect ? 1 : 0),
        globalTotalTimeSpent: FieldValue.increment(timeSpent),
      });
    }

    res.status(200).json({ message: 'Progress updated successfully.' });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

/**
 * Calculates a new mastery score based on performance.
 * A high rating from a low score results in a large gain.
 * A low rating from a high score results in a larger loss.
 */
const calculateNewMastery = (currentScore: number, performance: number): number => {
  const maxGain = 0.25; // Max score increase on a perfect answer
  const maxLoss = 0.4;  // Max score decrease on a wrong answer

  // The 'gain' is proportional to how much room there is to grow.
  // A perfect performance (1.0) on a low score (0.1) yields a large gain.
  const gain = (1 - currentScore) * performance * maxGain;

  // The 'loss' is proportional to the current score.
  // A bad performance (0.0) on a high score (0.9) yields a large loss.
  const loss = currentScore * (1 - performance) * maxLoss;

  let newScore = currentScore + gain - loss;
  
  if (newScore > 1) newScore = 1;
  if (newScore < 0) newScore = 0;
  return newScore;
};

/**
 * Calculates the next review date based on the mastery score.
 * Higher mastery means a longer interval.
 */
const calculateNextReviewDate = (masteryScore: number): Date => {
  const minInterval = 1; // 1 day for the lowest mastery
  const maxInterval = 90; // 90 days for the highest mastery
  const intervalDays = minInterval + Math.floor(masteryScore * (maxInterval - minInterval));
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + intervalDays);
  return nextReview;
};
