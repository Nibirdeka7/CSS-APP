const Match = require('../models/Match');
const Investment = require('../models/Investment');
const mongoose = require('mongoose');

/**
 * GET /matches/event/:eventId
 * Retrieves all matches for a specific event
 */
exports.getMatchesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const matches = await Match.find({ event: eventId })
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('winner', 'name')
      .sort({ startTime: 1 });

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching matches for this event", error });
  }
};

/**
 * GET /matches/:id
 * Retrieves details for a single match
 */
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('event', 'name sport')
      .populate('teamA')
      .populate('teamB')
      .populate('winner', 'name');

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: "Error fetching match details", error });
  }
};

/**
 * GET /matches/:id/stats
 * Returns the total points invested in Team A vs Team B
 */
exports.getMatchStats = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await Investment.aggregate([
      { 
        $match: { match: new mongoose.Types.ObjectId(id) } 
      },
      {
        $group: {
          _id: "$team", // Group by team ID
          totalPoints: { $sum: "$pointsInvested" },
          investorCount: { $sum: 1 } // Optional: counts how many people invested
        }
      }
    ]);

    // Format the response for the frontend
    const response = {
      matchId: id,
      teams: stats.map(s => ({
        teamId: s._id,
        totalInvested: s.totalPoints,
        totalInvestors: s.investorCount
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error calculating match stats", error: error.message });
  }
};