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
exports.getPriorityMatrixStats = exports.getHeatmapStats = exports.getDashboardStats = void 0;
const firebase_1 = require("../config/firebase");
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const userId = req.user.uid;
    try {
        const progressSnapshot = yield firebase_1.db.collection('userSubcategoryProgress').where('userId', '==', userId).get();
        if (progressSnapshot.empty) {
            return res.status(200).json({
                questionsDue: 0,
                subcategoriesMastered: 0,
                overallAccuracy: 0,
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
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.getDashboardStats = getDashboardStats;
const getHeatmapStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const userId = req.user.uid;
    try {
        const progressSnapshot = yield firebase_1.db.collection('userSubcategoryProgress').where('userId', '==', userId).get();
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
    }
    catch (error) {
        console.error('Error fetching heatmap stats:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.getHeatmapStats = getHeatmapStats;
const getPriorityMatrixStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const userId = req.user.uid;
    try {
        const progressSnapshot = yield firebase_1.db.collection('userSubcategoryProgress').where('userId', '==', userId).get();
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
    }
    catch (error) {
        console.error('Error fetching priority matrix stats:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});
exports.getPriorityMatrixStats = getPriorityMatrixStats;
