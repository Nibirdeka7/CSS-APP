const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller.js');

router.get('/event/:eventId', matchController.getMatchesByEvent);

router.get('/:id', matchController.getMatchById);

module.exports = router;