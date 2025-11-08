import express from 'express';
import authMiddleware from '../middleware/authMiddleware';

// Import all controller functions
import { initUser } from '../controllers/authController';
import { getTodaysQuestions, getPracticeMoreQuestions, getTargetedPracticeQuestions } from '../controllers/questionController';
import { submitProgress, resetAllProgress } from '../controllers/progressController';
import { getSettings, updateSettings, markDashboardGuideSeen } from '../controllers/settingsController';
import { getDashboardStats, getHeatmapStats, getPriorityMatrixStats, getStreakData, completePracticeSession } from '../controllers/statsController';

const router = express.Router();

// Auth & User
router.post('/init-user', authMiddleware, initUser);

// Settings
router.get('/settings', authMiddleware, getSettings);
router.put('/settings', authMiddleware, updateSettings);
router.put('/settings/viewed-dashboard-guide', authMiddleware, markDashboardGuideSeen);

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
router.post('/stats/complete-session', authMiddleware, completePracticeSession);

export default router;
