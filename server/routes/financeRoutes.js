import express from 'express';
import {
    createInvoice,
    getInvoices,
    updateInvoiceStatus,
    getAccounts,
    getTransactions
} from '../controllers/financeController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Invoice routes
router.post('/invoices', authorizeRole('Admin', 'Manager'), createInvoice);
router.get('/invoices', getInvoices);
router.put('/invoices/:id', authorizeRole('Admin', 'Manager'), updateInvoiceStatus);

// Account routes
router.get('/accounts', getAccounts);

// Transaction routes
router.get('/transactions', getTransactions);

export default router;
