const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const { protect } = require("../middleware/authMiddleware.js");

// All routes here require login
router.use(protect);

router.patch("/me", userController.updateUserProfile);

module.exports = router;