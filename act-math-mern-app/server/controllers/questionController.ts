import { Response } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';
import { DocumentData } from 'firebase-admin/firestore';

export const getTodaysQuestions = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    // --- Snapshot accuracy at the start of a session for trend arrow ---
    const statsRef = db.collection('userStats').doc(userId);
    const statsDoc = await statsRef.get();
    if (statsDoc.exists) {
      const statsData = statsDoc.data()!;
      await statsRef.update({
        previousRollingAccuracy: statsData.currentRollingAccuracy || 0
      });
    }

    // --- Get questions seen today to exclude them ---
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    const dailyActivityRef = db.collection('userDailyActivity').doc(`${userId}_${today}`);
    const dailyActivityDoc = await dailyActivityRef.get();
    const seenQuestionIds = new Set<string>(dailyActivityDoc.exists ? dailyActivityDoc.data()!.seenQuestionIds : []);

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const practiceSessionSize = userData?.dailyQuestionLimit || 10;

    const progressSnapshot = await db.collection('userSubcategoryProgress').where('userId', '==', userId).get();
    const userProgress: { [key: string]: any } = {};
    progressSnapshot.forEach(doc => {
      userProgress[doc.data().subcategory] = doc.data();
    });

    const allQuestionsSnapshot = await db.collection('questions').get();
    const allSubcategories = [...new Set(allQuestionsSnapshot.docs.flatMap(doc => doc.data().subcategories || []))];

    const now = new Date();
    let prioritizedList = allSubcategories.map(subcategory => {
      const progress = userProgress[subcategory];
      if (!progress) return { subcategory, priority: 100 }; // High priority for new subcategories
      const isDue = progress.nextReviewDate.toDate() <= now;
      if (isDue) return { subcategory, priority: 10 / (progress.masteryScore + 0.1) };
      return { subcategory, priority: 0 };
    });

    prioritizedList = prioritizedList.filter(p => p.priority > 0);
    prioritizedList.sort((a, b) => b.priority - a.priority);
    
    const sessionQuestions: DocumentData[] = [];
    const usedQuestionIds = new Set<string>(seenQuestionIds); // Initialize with already seen questions

    for (const item of prioritizedList) {
      if (sessionQuestions.length >= practiceSessionSize) break;

      const qSnapshot = await db.collection('questions')
        .where('subcategories', 'array-contains', item.subcategory)
        .get();
      
      const availableDocs = qSnapshot.docs.filter(doc => !usedQuestionIds.has(doc.id));

      if (availableDocs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableDocs.length);
        const chosenDoc = availableDocs[randomIndex];
        sessionQuestions.push(chosenDoc.data());
        usedQuestionIds.add(chosenDoc.id);
      }
    }

    if (sessionQuestions.length < practiceSessionSize) {
      const allQuestions = (await db.collection('questions').get()).docs;
      const unseenQuestions = allQuestions.filter(doc => !usedQuestionIds.has(doc.id));

      while (sessionQuestions.length < practiceSessionSize && unseenQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * unseenQuestions.length);
        const randomDoc = unseenQuestions.splice(randomIndex, 1)[0];
        sessionQuestions.push(randomDoc.data());
      }
    }

    if (sessionQuestions.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(sessionQuestions);

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getPracticeMoreQuestions = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  try {
    const questionsRef = db.collection('questions');
    const randomId = db.collection('questions').doc().id;

    const snapshot = await questionsRef
      .where(admin.firestore.FieldPath.documentId(), '>=', randomId)
      .limit(10)
      .get();

    let questions = snapshot.docs.map(doc => doc.data());

    if (questions.length < 10) {
      const remaining = 10 - questions.length;
      const remainingSnapshot = await questionsRef
        .where(admin.firestore.FieldPath.documentId(), '<', randomId)
        .limit(remaining)
        .get();
      questions = questions.concat(remainingSnapshot.docs.map(doc => doc.data()));
    }
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching practice more questions:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

export const getTargetedPracticeQuestions = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const { subcategory } = req.query;

  if (!subcategory || typeof subcategory !== 'string') {
    return res.status(400).send({ message: 'A subcategory query parameter is required.' });
  }

  try {
    const snapshot = await db.collection('questions')
      .where('subcategories', 'array-contains', subcategory)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const allQuestions = snapshot.docs.map(doc => doc.data());
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);

    res.status(200).json(selectedQuestions);

  } catch (error) {
    console.error('Error fetching targeted practice questions:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};