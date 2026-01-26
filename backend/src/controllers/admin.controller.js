const User = require("../models/User");
const Event = require("../models/Events.model");
const Match = require("../models/Match.model");
const Team = require("../models/Team.model");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const activeMatches = await Match.countDocuments({ status: "LIVE" });
    const totalTeams = await Team.countDocuments();
    const pendingTeams = await Team.countDocuments({ approved: false });

    res.json({
      totalUsers,
      totalEvents,
      activeMatches,
      totalTeams,
      pendingTeams,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentActivities = async (req, res) => {
  res.json([]); // Implement activity log logic here if needed
};
