const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { protect, adminOnly } = require('../middleware/AuthMiddleware.js');

// Path: /api/transactions/my
// Get current user's point history
router.get('/my', protect, transactionController.getMyTransactions);

// Path: /api/transactions/admin-adjust
// Admin route to reward/correct points
router.post('/admin-adjust', protect, adminOnly, transactionController.adminAdjustPoints);

module.exports = router;