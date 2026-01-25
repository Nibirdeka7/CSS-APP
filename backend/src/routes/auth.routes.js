const express = require("express");
const router = express.Router();
const { googleAuth, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
router.post("/google", googleAuth);
router.get("/me", protect, getMe);

module.exports = router;
