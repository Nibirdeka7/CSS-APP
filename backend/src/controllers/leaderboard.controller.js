const User = require("../models/User");
const Team = require("../models/Team.model");
const Match = require("../models/Match.model");
const redis = require("../config/redis");

// Get Top Users by Activity/Engagement
exports.getTopUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("name username profilePicture scholarId points createdAt")
      .limit(20);

    const leaderboard = users.map((u, index) => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      profilePicture: u.profilePicture,
      scholarId: u.scholarId,
      points: u.points || 0,
      rank: index + 1,
    }));

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("User Leaderboard Error:", error);
    res.status(500).json({ message: "Error fetching user leaderboard" });
  }
};

// Get Top Teams by Tournament Performance / Wins
exports.getTopTeams = async (req, res) => {
  try {
    // Group completed matches by winner
    const winningStats = await Match.aggregate([
      { $match: { status: "COMPLETED", winner: { $ne: null } } },
      { $group: { _id: "$winner", wins: { $sum: 1 } } },
      { $sort: { wins: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "teamDetails",
        },
      },
      { $unwind: "$teamDetails" },
      {
        $lookup: {
          from: "events",
          localField: "teamDetails.event",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      {
        $project: {
          _id: 1,
          wins: 1,
          teamName: "$teamDetails.name",
          highestRoundReached: "$teamDetails.highestRoundReached",
          sport: { $arrayElemAt: ["$eventDetails.sport", 0] },
        },
      },
    ]);

    if (winningStats && winningStats.length > 0) {
      return res.status(200).json(winningStats);
    }

    // Fallback if no matches completed yet: show approved teams
    const teams = await Team.find({ approved: true })
      .populate("event", "sport name")
      .limit(10);

    const fallbackList = teams.map((t) => ({
      _id: t._id,
      wins: 0,
      teamName: t.name,
      highestRoundReached: t.highestRoundReached || "NONE",
      sport: t.event?.sport || "SPORTS",
    }));

    res.status(200).json(fallbackList);
  } catch (error) {
    console.error("Team Leaderboard Error:", error);
    res.status(500).json({ message: "Error fetching team leaderboard" });
  }
};
