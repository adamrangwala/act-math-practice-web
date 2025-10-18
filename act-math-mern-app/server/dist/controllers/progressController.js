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
exports.submitProgress = void 0;
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const submitProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const { questionId, performanceRating, timeSpent, context } = req.body;
    const userId = req.user.uid;
    if (!questionId || performanceRating === undefined || !context || timeSpent === undefined) {
        return res.status(400).send({ message: 'Missing required progress data.' });
    }
    try {
        const questionRef = firebase_1.db.collection('questions').doc(questionId);
        const questionDoc = yield questionRef.get();
        if (!questionDoc.exists) {
            return res.status(404).send({ message: 'Question not found.' });
        }
        const subcategories = ((_a = questionDoc.data()) === null || _a === void 0 ? void 0 : _a.subcategories) || [];
        const isCorrect = performanceRating > 0;
        // Step 1: Update User's Personal Subcategory Progress (always)
        for (const subcategory of subcategories) {
            const progressId = `${userId}_${subcategory.replace(/\s+/g, '-')}`;
            const progressRef = firebase_1.db.collection('userSubcategoryProgress').doc(progressId);
            const progressDoc = yield progressRef.get();
            if (progressDoc.exists) {
                const currentProgress = progressDoc.data();
                const newMasteryScore = calculateNewMastery(currentProgress.masteryScore, performanceRating);
                yield progressRef.update({
                    masteryScore: newMasteryScore,
                    lastReviewedAt: firestore_1.FieldValue.serverTimestamp(),
                    nextReviewDate: calculateNextReviewDate(newMasteryScore),
                    totalAttempts: firestore_1.FieldValue.increment(1),
                    correctAttempts: firestore_1.FieldValue.increment(isCorrect ? 1 : 0),
                    totalTimeSpent: firestore_1.FieldValue.increment(timeSpent),
                });
            }
            else {
                const newMasteryScore = calculateNewMastery(0.1, performanceRating);
                yield progressRef.set({
                    userId,
                    subcategory,
                    masteryScore: newMasteryScore,
                    lastReviewedAt: firestore_1.FieldValue.serverTimestamp(),
                    nextReviewDate: calculateNextReviewDate(newMasteryScore),
                    totalAttempts: 1,
                    correctAttempts: isCorrect ? 1 : 0,
                    totalTimeSpent: timeSpent,
                });
            }
        }
        // Step 2: Update Global Question Stats (conditionally)
        if (context === 'practice_session' || context === 'mock_test') {
            yield questionRef.update({
                globalTotalAttempts: firestore_1.FieldValue.increment(1),
                globalCorrectAttempts: firestore_1.FieldValue.increment(isCorrect ? 1 : 0),
                globalTotalTimeSpent: firestore_1.FieldValue.increment(timeSpent),
            });
        }
        res.status(200).json({ message: 'Progress updated successfully.' });
    }
    catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.submitProgress = submitProgress;
/**
 * Calculates a new mastery score based on performance.
 * A high rating from a low score results in a large gain.
 * A low rating from a high score results in a larger loss.
 */
const calculateNewMastery = (currentScore, performance) => {
    const maxGain = 0.25; // Max score increase on a perfect answer
    const maxLoss = 0.4; // Max score decrease on a wrong answer
    // The 'gain' is proportional to how much room there is to grow.
    // A perfect performance (1.0) on a low score (0.1) yields a large gain.
    const gain = (1 - currentScore) * performance * maxGain;
    // The 'loss' is proportional to the current score.
    // A bad performance (0.0) on a high score (0.9) yields a large loss.
    const loss = currentScore * (1 - performance) * maxLoss;
    let newScore = currentScore + gain - loss;
    if (newScore > 1)
        newScore = 1;
    if (newScore < 0)
        newScore = 0;
    return newScore;
};
/**
 * Calculates the next review date based on the mastery score.
 * Higher mastery means a longer interval.
 */
const calculateNextReviewDate = (masteryScore) => {
    const minInterval = 1; // 1 day for the lowest mastery
    const maxInterval = 90; // 90 days for the highest mastery
    const intervalDays = minInterval + Math.floor(masteryScore * (maxInterval - minInterval));
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);
    return nextReview;
};
