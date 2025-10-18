import express from 'express';
import authMiddleware from '../middleware/authMiddleware';

// Import all controller functions
import { initUser } from '../controllers/authController';
import { getTodaysQuestions } from '../controllers/questionController';
import { submitProgress } from '../controllers/progressController';
import { getDashboardStats, getHeatmapStats, getPriorityMatrixStats } from '../controllers/statsController';

const router = express.Router();

// Auth & User
router.post('/users/init', authMiddleware, initUser);

// Practice
router.get('/questions/today', authMiddleware, getTodaysQuestions);
router.post('/progress/submit', authMiddleware, submitProgress);

// Stats
router.get('/stats/dashboard', authMiddleware, getDashboardStats);
router.get('/stats/heatmap', authMiddleware, getHeatmapStats);
router.get('/stats/priority-matrix', authMiddleware, getPriorityMatrixStats);

export default router;