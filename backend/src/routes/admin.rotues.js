const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/AuthMiddleware");

const adminController = require("../controllers/admin.controller");
const eventController = require("../controllers/event.controller");

// Apply protections
router.use(protect);
router.use(adminOnly);

// Event Routes 
router.post("/events", eventController.createEvent);
router.patch("/events/:id", eventController.updateEvent);
router.delete("/events/:id", eventController.deleteEvent);

// Team Routes
router.get("/teams/pending", adminController.getPendingTeams);
router.patch("/teams/:id/approve", adminController.approveTeam);
router.get("/teams/eligible/:eventId", adminController.getEligibleTeams);


// Match Routes
router.post("/matches", adminController.createMatch);
router.patch("/matches/:id/start", adminController.startMatch);
router.patch("/matches/:id/score", adminController.updateScore);
router.patch("/matches/:id/end", adminController.endMatch);
router.delete("/matches/:id", adminController.deleteMatch);

module.exports = router;
