import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';
import { FieldValue } from 'firebase-admin/firestore';

interface ProgressSubmission {
  questionId: string;
  performanceRating: number; // 0.0 to 1.0
  timeSpent: number; // in seconds
  context: 'practice_session' | 'targeted_practice' | 'mock_test';
  selectedAnswerIndex: number;
}

export const submitProgress = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const { questionId, performanceRating, timeSpent, context, selectedAnswerIndex }: ProgressSubmission = req.body;
  const userId = req.user.uid;

  if (!questionId || performanceRating === undefined || !context || timeSpent === undefined || selectedAnswerIndex === undefined) {
    return res.status(400).send({ message: 'Missing required progress data.' });
  }

  try {
    const questionRef = db.collection('questions').doc(questionId);
    const questionDoc = await questionRef.get();
    if (!questionDoc.exists) {
      return res.status(404).send({ message: 'Question not found.' });
    }
    const questionData = questionDoc.data()!;
    const subcategories = questionData.subcategories || [];

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

    // Atomically increment the selected option count
    await db.runTransaction(async (transaction) => {
      const questionDoc = await transaction.get(questionRef);
      if (!questionDoc.exists) {
        throw new Error("Question not found in transaction.");
      }
      const questionData = questionDoc.data()!;
      
      const currentCounts = questionData.optionSelectionCounts || Array(questionData.options.length).fill(0);
      
      if (typeof selectedAnswerIndex === 'number' && selectedAnswerIndex >= 0 && selectedAnswerIndex < currentCounts.length) {
        currentCounts[selectedAnswerIndex]++;
      }

      const updatePayload: { [key: string]: any } = {
        globalTotalAttempts: FieldValue.increment(1),
        globalCorrectAttempts: FieldValue.increment(isCorrect ? 1 : 0),
        globalTotalTimeSpent: FieldValue.increment(timeSpent),
        optionSelectionCounts: currentCounts,
      };

      if (context === 'practice_session' || context === 'mock_test') {
        transaction.update(questionRef, updatePayload);
      }
    });

    res.status(200).json({ message: 'Progress updated successfully.' });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const resetAllProgress = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const snapshot = await db.collection('userSubcategoryProgress').where('userId', '==', userId).get();
    if (snapshot.empty) {
      return res.status(200).send({ message: 'No progress data to delete.' });
    }

    // Batch delete to handle large numbers of documents
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(200).send({ message: 'User progress has been successfully reset.' });
  } catch (error) {
    console.error('Error resetting user progress:', error);
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
