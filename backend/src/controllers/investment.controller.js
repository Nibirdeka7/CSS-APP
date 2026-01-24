const Investment = require("../models/Investment.model.js");
const User = require("../models/User");
const Match = require("../models/Match.model.js");
const mongoose = require("mongoose");
/**
 * POST /investments
 * Place a new investment on a team
 */
exports.createInvestment = async (req, res) => {
  try {
    const { matchId, teamId, pointsInvested } = req.body;
    const userId = req.user._id;

    // 1. Validate Match exists and is not COMPLETED
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Checking for the upcoming status
    if (match.status !== "UPCOMING") {
      return res.status(400).json({
        message: `Investment closed. Match is ${match.status.toLowerCase()}.`,
      });
    }


    // 2. Validate User points
    const user = await User.findById(userId);
    if (user.points < pointsInvested) {
      return res.status(400).json({ message: "Insufficient points balance" });
    }

    // 3. Create Investment
    const newInvestment = new Investment({
      user: userId,
      match: matchId,
      team: teamId,
      pointsInvested,
    });

    // 4. Deduct points from User and Save Investment
    // Use a simple update (for production, consider a MongoDB Session/Transaction)
    user.points -= pointsInvested;
    await user.save();
    await newInvestment.save();

    res.status(201).json({
      message: "Investment placed successfully",
      remainingPoints: user.points,
      investment: newInvestment,
    });
  } catch (error) {
    console.error(error);
    console.log("Investment Creation Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * GET /investments/match/:matchId
 * Get all investments for a specific match (e.g., to show total pool)
 */
exports.getInvestmentsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const investments = await Investment.find({ match: matchId })
      .populate("user", "name")
      .populate("team", "name");

    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching investments" });
  }
};

// Add this to your investment.controller.js
exports.getMatchInvestmentStats = async (req, res) => {
  try {
    const { matchId } = req.params;
    const stats = await Investment.aggregate([
      { $match: { match: new mongoose.Types.ObjectId(matchId) } },
      {
        $group: {
          _id: "$team", // Grouping by Team ID
          totalPoints: { $sum: "$pointsInvested" }, // Summing the points
          investorCount: { $sum: 1 }, // Counting total investors
        },
      },
    ]);
    res.status(200).json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};
exports.getMyInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
      .populate("team", "name") // Get Team Name
      .populate("match") // Get Match Details
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching investments" });
  }
};
