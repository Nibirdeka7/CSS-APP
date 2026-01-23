const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");

// Get all events
router.get("/", eventController.getEvents);

// Get specific event details
router.get("/:id", eventController.getEventById);

module.exports = router;
