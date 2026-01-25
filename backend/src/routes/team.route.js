const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");
const { protect } = require("../middleware/authMiddleware.js"); // Your auth middleware

router.post("/", protect, teamController.createTeam);
router.get("/my", protect, teamController.getMyTeams);
router.get("/event/:eventId", protect, teamController.getTeamsByEvent);
router.get("/:id", protect, teamController.getTeamById);
router.put("/:id", protect, teamController.updateTeam);
router.put("/:id/approve", protect, teamController.approveTeam);
router.delete("/:id/reject", protect, teamController.rejectTeam);

module.exports = router;
