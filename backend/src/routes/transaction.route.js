const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
// const { protect, admin } = require('../middleware/authMiddleware');

// Path: /api/transactions/my
// Get current user's point history
router.get('/my', protect, transactionController.getMyTransactions);

// Path: /api/transactions/admin-adjust
// Admin route to reward/correct points
router.post('/admin-adjust',  transactionController.adminAdjustPoints);

module.exports = router;