const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
// const { protect } = require('../middleware/authMiddleware'); // Your auth middleware


router.post('/', teamController.createTeam);

router.get('/my', teamController.getMyTeams);

router.get('/event/:eventId', teamController.getTeamsByEvent);

module.exports = router;