import express from 'express';
import authMiddleware from '../middleware/authMiddleware';

// Import all controller functions
import { initUser, getUserSettings, updateUserSettings } from '../controllers/authController';
import { getTodaysQuestions, getPracticeMoreQuestions, getTargetedPracticeQuestions } from '../controllers/questionController';
import { submitProgress, resetAllProgress } from '../controllers/progressController';
import { getDashboardStats, getHeatmapStats, getPriorityMatrixStats, getStreakData } from '../controllers/statsController';

const router = express.Router();

// Auth & User
router.post('/users/init', authMiddleware, initUser);
router.get('/settings', authMiddleware, getUserSettings);
router.put('/settings', authMiddleware, updateUserSettings);

// Practice
router.get('/questions/today', authMiddleware, getTodaysQuestions);
router.get('/questions/practice-more', authMiddleware, getPracticeMoreQuestions);
router.get('/questions/targeted-practice', authMiddleware, getTargetedPracticeQuestions);
router.post('/progress/submit', authMiddleware, submitProgress);
router.delete('/progress/all', authMiddleware, resetAllProgress);

// Stats
router.get('/stats/dashboard', authMiddleware, getDashboardStats);
router.get('/stats/heatmap', authMiddleware, getHeatmapStats);
router.get('/stats/priority-matrix', authMiddleware, getPriorityMatrixStats);
router.get('/stats/streak', authMiddleware, getStreakData);

export default router;
