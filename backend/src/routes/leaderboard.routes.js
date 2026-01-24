const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboard.controller");

router.get("/users", leaderboardController.getTopUsers);
router.get("/teams", leaderboardController.getTopTeams);

module.exports = router;