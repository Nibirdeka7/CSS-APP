const express = require("express");
const router = express.Router();
const matchController = require("../controllers/match.controller.js");
const { protect } = require("../middleware/authMiddleware.js");

// --- Public View Routes ---
router.get("/event/:eventId", matchController.getMatchesByEvent);
router.get("/:id/stats", matchController.getMatchStats);

// --- Admin Action Routes ---
// 1. Create
router.post("/", protect, matchController.createMatch);

// 2. Manage Live Match
router.patch("/:id/start", protect, matchController.startMatch); // Start
router.patch("/:id/score", protect, matchController.updateScore); // Update Score
router.patch("/:id/end", protect, matchController.endMatch); // End & Distribute Points

// 3. Alternative/Legacy Result update
router.put("/:id/result", protect, matchController.updateMatchResult);

// 4. View Single Match (Wildcard - keep at bottom)
router.get("/:id", matchController.getMatchById);
router.delete("/:id", protect, matchController.deleteMatch);

module.exports = router;
