import express from 'express';
import {
    calculateProjectRisk,
    getDashboardStats,
    getFinancialSummary
} from '../controllers/insightController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Risk calculation for specific project
router.get('/risk/:id', calculateProjectRisk);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// Financial summary
router.get('/financial-summary', getFinancialSummary);

export default router;
