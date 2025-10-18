"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
// Import all controller functions
const authController_1 = require("../controllers/authController");
const questionController_1 = require("../controllers/questionController");
const progressController_1 = require("../controllers/progressController");
const statsController_1 = require("../controllers/statsController");
const router = express_1.default.Router();
// Auth & User
router.post('/users/init', authMiddleware_1.default, authController_1.initUser);
router.get('/settings', authMiddleware_1.default, authController_1.getUserSettings);
router.put('/settings', authMiddleware_1.default, authController_1.updateUserSettings);
// Practice
router.get('/questions/today', authMiddleware_1.default, questionController_1.getTodaysQuestions);
router.post('/progress/submit', authMiddleware_1.default, progressController_1.submitProgress);
// Stats
router.get('/stats/dashboard', authMiddleware_1.default, statsController_1.getDashboardStats);
router.get('/stats/heatmap', authMiddleware_1.default, statsController_1.getHeatmapStats);
router.get('/stats/priority-matrix', authMiddleware_1.default, statsController_1.getPriorityMatrixStats);
exports.default = router;
