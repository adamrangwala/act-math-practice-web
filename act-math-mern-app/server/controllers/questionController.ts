import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './authController';
import { DocumentData } from 'firebase-admin/firestore';

export const getTodaysQuestions = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  const userId = req.user.uid;

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const practiceSessionSize = req.query.limit 
      ? parseInt(req.query.limit as string) 
      : userData?.dailyQuestionLimit || 10;

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
    const usedQuestionIds = new Set<string>();

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
      while (sessionQuestions.length < practiceSessionSize && allQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        const randomDoc = allQuestions.splice(randomIndex, 1)[0];
        if (!usedQuestionIds.has(randomDoc.id)) {
          sessionQuestions.push(randomDoc.data());
          usedQuestionIds.add(randomDoc.id);
        }
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
    const allQuestionsSnapshot = await db.collection('questions').get();
    const allQuestions = allQuestionsSnapshot.docs.map(doc => doc.data());
    
    const practiceMoreSize = 3;
    const randomQuestions: DocumentData[] = [];
    const usedIndices = new Set<number>();

    if (allQuestions.length <= practiceMoreSize) {
      return res.status(200).json(allQuestions);
    }

    while (randomQuestions.length < practiceMoreSize) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      if (!usedIndices.has(randomIndex)) {
        randomQuestions.push(allQuestions[randomIndex]);
        usedIndices.add(randomIndex);
      }
    }
    
    res.status(200).json(randomQuestions);
  } catch (error) {
    console.error('Error fetching practice more questions:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};