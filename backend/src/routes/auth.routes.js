const express = require("express");
const router = express.Router();
const { googleAuth, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/authMiddleware.js");
router.post("/google", googleAuth);
router.get("/me", protect, getMe);

module.exports = router;
