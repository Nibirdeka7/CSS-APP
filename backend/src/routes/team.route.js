const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { protect } = require('../middleware/authMiddleware'); // Your auth middleware


router.post('/', protect, teamController.createTeam);

router.get('/my', protect, teamController.getMyTeams);

router.get('/event/:eventId', protect, teamController.getTeamsByEvent);
module.exports = router;