"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPracticeMoreQuestions = exports.getTodaysQuestions = void 0;
const firebase_1 = require("../config/firebase");
const getTodaysQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const userId = req.user.uid;
    try {
        const userDoc = yield firebase_1.db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const practiceSessionSize = req.query.limit
            ? parseInt(req.query.limit)
            : (userData === null || userData === void 0 ? void 0 : userData.dailyQuestionLimit) || 10;
        const progressSnapshot = yield firebase_1.db.collection('userSubcategoryProgress').where('userId', '==', userId).get();
        const userProgress = {};
        progressSnapshot.forEach(doc => {
            userProgress[doc.data().subcategory] = doc.data();
        });
        const allQuestionsSnapshot = yield firebase_1.db.collection('questions').get();
        const allSubcategories = [...new Set(allQuestionsSnapshot.docs.flatMap(doc => doc.data().subcategories || []))];
        const now = new Date();
        let prioritizedList = allSubcategories.map(subcategory => {
            const progress = userProgress[subcategory];
            if (!progress)
                return { subcategory, priority: 100 }; // High priority for new subcategories
            const isDue = progress.nextReviewDate.toDate() <= now;
            if (isDue)
                return { subcategory, priority: 10 / (progress.masteryScore + 0.1) };
            return { subcategory, priority: 0 };
        });
        prioritizedList = prioritizedList.filter(p => p.priority > 0);
        prioritizedList.sort((a, b) => b.priority - a.priority);
        const sessionQuestions = [];
        const usedQuestionIds = new Set();
        for (const item of prioritizedList) {
            if (sessionQuestions.length >= practiceSessionSize)
                break;
            const qSnapshot = yield firebase_1.db.collection('questions')
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
            const allQuestions = (yield firebase_1.db.collection('questions').get()).docs;
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
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.getTodaysQuestions = getTodaysQuestions;
const getPracticeMoreQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    try {
        const allQuestionsSnapshot = yield firebase_1.db.collection('questions').get();
        const allQuestions = allQuestionsSnapshot.docs.map(doc => doc.data());
        const practiceMoreSize = 3;
        const randomQuestions = [];
        const usedIndices = new Set();
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
    }
    catch (error) {
        console.error('Error fetching practice more questions:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.getPracticeMoreQuestions = getPracticeMoreQuestions;
