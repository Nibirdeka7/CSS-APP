const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");
const eventController = require("../controllers/event.controller");
router.use(protect);
router.use(admin);

// Event Routes
router.post("/events", eventController.createEvent);
router.patch("/events/:id", eventController.updateEvent);
router.delete("/events/:id", eventController.deleteEvent);

//  Team Routes
router.get("/teams/pending", adminController.getPendingTeams);
router.patch("/teams/:id/approve", adminController.approveTeam);

// Match Routes
router.post("/matches", adminController.createMatch);
router.patch("/matches/:id/start", adminController.startMatch);
router.patch("/matches/:id/score", adminController.updateScore);
router.patch("/matches/:id/end", adminController.endMatch);
router.get("/teams/eligible/:eventId", adminController.getEligibleTeams);

module.exports = router;
