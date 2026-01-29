const User = require("../models/User");
const Investment = require("../models/Investment.model");
const redis = require("../config/redis");
// Get Top 10 Users by Points
exports.getTopUsers = async (req, res) => {
  try {
   
    const leaderboard = await Investment.aggregate([
      // 1. Group by User ID and sum their investments
      {
        $group: {
          _id: "$user",
          totalInvested: { $sum: "$pointsInvested" },
          firestInvestmentDate: { $min: "$createdAt" },
        },
      },
      // 2. Sort by highest investment first
      { $sort: { totalInvested: -1, firestInvestmentDate: 1} },
      // 3. Limit to top 10
      { $limit: 10 },
      // 4. Join with Users collection to get Name
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      // 5. Unwind to make userDetails an object instead of array
      { $unwind: "$userDetails" },
      // 6. Project final clean structure
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          // We return 'points' here so your frontend code (item.points) still works
          // but now it represents "Total Invested"
          points: "$totalInvested",
        },
      },
    ]);
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("User Leaderboard Error:", error);
    res.status(500).json({ message: "Error fetching user leaderboard" });
  }
};

// Get Top 10 Teams by Total Investment
exports.getTopTeams = async (req, res) => {
  try {
   
    const leaderboard = await Investment.aggregate([
      // Group by Team ID and sum the pointsInvested
      {
        $group: {
          _id: "$team",
          totalInvestment: { $sum: "$pointsInvested" },
          firstInvestment: { $min: "$createdAt" },
        },
      },
      // Sort by highest investment first
      { $sort: { totalInvestment: -1, firstInvestment: 1 } },
      // Limit to top 10
      { $limit: 10 },
      // Join with Teams collection to get Team Name
      {
        $lookup: {
          from: "teams", // verify this matches your MongoDB collection name (usually lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "teamDetails",
        },
      },
      // Unwind the array created by lookup
      { $unwind: "$teamDetails" },
      // Select final fields
      {
        $project: {
          _id: 1,
          totalInvestment: 1,
          teamName: "$teamDetails.name",
          sport: "$teamDetails.sport", // Assuming sport exists on Team model
        },
      },
    ]);
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching team leaderboard" });
  }
};