const express = require("express");
const router = express.Router();
const investmentController = require("../controllers/investment.controller.js");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, investmentController.createInvestment);
router.get("/my", protect, investmentController.getMyInvestments);

router.get(
  "/match/:matchId",
  protect,
  investmentController.getInvestmentsByMatch,
);

router.get(
  "/match/:matchId/stats",
  protect,
  investmentController.getMatchInvestmentStats,
);
module.exports = router;
