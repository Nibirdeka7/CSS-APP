const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");
const { protect } = require("../middleware/authMiddleware.js");

// 1. Create Team
router.post("/", protect, teamController.createTeam);

// ==========================================
// ⚠️ THESE SPECIFIC ROUTES MUST BE AT THE TOP
// ==========================================
router.get("/my", protect, teamController.getMyTeams);
router.get("/pending", protect, teamController.getPendingTeams);
router.get("/eligible/:eventId", protect, teamController.getEligibleTeams); // <--- This feeds the dropdown
router.get("/event/:eventId", protect, teamController.getTeamsByEvent);

// 2. Admin Actions
router.put("/:id/approve", protect, teamController.approveTeam);
router.delete("/:id/reject", protect, teamController.rejectTeam);

// 3. Update Team
router.put("/:id", protect, teamController.updateTeam);

// 4. Generic ID Route (MUST BE LAST)
router.get("/:id", protect, teamController.getTeamById);

module.exports = router;
