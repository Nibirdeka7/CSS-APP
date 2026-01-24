const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investment.controller.js');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, investmentController.createInvestment);

router.get('/match/:matchId', protect, investmentController.getInvestmentsByMatch);

router.get('/matches/:matchId/stats', protect, investmentController.getMatchInvestmentStats);
module.exports = router;