const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { protect } = require("../middleware/authMiddleware");

// --- Public View Routes ---
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);

// --- Admin Action Routes ---
router.post("/", protect, eventController.createEvent); // Create
router.patch("/:id", protect, eventController.updateEvent); // Update
router.delete("/:id", protect, eventController.deleteEvent); // Delete

module.exports = router;
