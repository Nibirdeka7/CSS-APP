const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const adminController = require("../controllers/admin.controller");

router.use(protect);
router.use(adminOnly);

router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/dashboard/activities", adminController.getRecentActivities);

module.exports = router;
