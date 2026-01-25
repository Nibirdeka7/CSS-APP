const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notification.controller");

router.get("/my", protect, notificationController.getMyNotifications);
router.put("/:id/read", protect, notificationController.markAsRead);
router.put("/read-all", protect, notificationController.markAllRead);

module.exports = router;
