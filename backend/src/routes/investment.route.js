const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investment.controller.js');
// const { protect } = require('../middleware/authMiddleware');


router.post('/',  investmentController.createInvestment);

router.get('/match/:matchId', investmentController.getInvestmentsByMatch);

module.exports = router;