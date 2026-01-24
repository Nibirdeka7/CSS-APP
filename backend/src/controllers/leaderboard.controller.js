const User = require("../models/User");
const Investment = require("../models/Investment.model");

// Get Top 10 Users by Points
exports.getTopUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name points") // Select only name and points
      .sort({ points: -1 }) // Descending order
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
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
        },
      },
      // Sort by highest investment first
      { $sort: { totalInvestment: -1 } },
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