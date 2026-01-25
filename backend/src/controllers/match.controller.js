const Match = require("../models/Match.model.js");
const Investment = require("../models/Investment.model.js");
const mongoose = require("mongoose");
const Notification = require("../models/Notification.js"); // <--- IMPORT NOTIFICATION
const Team = require("../models/Team.model.js"); // <--- IMPORT TEAM

/**
 * GET /matches/event/:eventId
 */
exports.getMatchesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const query = eventId === "all" ? {} : { event: eventId };

    const matches = await Match.find(query)
      .populate("event", "name sport")
      .populate("teamA", "name logo captain members")
      .populate("teamB", "name logo captain members")
      .sort({ startTime: -1 });

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /matches/:id
 */
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("event", "name sport")
      .populate("teamA")
      .populate("teamB")
      .populate("winner", "name");

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
 */
exports.getMatchStats = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await Investment.aggregate([
      {
        $match: { match: new mongoose.Types.ObjectId(id) },
      },
      {
        $group: {
          _id: "$team",
          totalPoints: { $sum: "$pointsInvested" },
          investorCount: { $sum: 1 },
        },
      },
    ]);

    const response = {
      matchId: id,
      teams: stats.map((s) => ({
        teamId: s._id,
        totalInvested: s.totalPoints,
        totalInvestors: s.investorCount,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error calculating match stats", error: error.message });
  }
};

/**
 * POST /matches
 * Admin schedules a match -> Notifies Captains
 */
exports.createMatch = async (req, res) => {
  try {
    const { eventId, teamAId, teamBId, startTime, venue, round } = req.body;

    const newMatch = new Match({
      event: eventId,
      teamA: teamAId,
      teamB: teamBId,
      startTime,
      venue,
      round: round || "NONE",
      status: "UPCOMING",
    });

    await newMatch.save();

    const teamA = await Team.findById(teamAId);
    const teamB = await Team.findById(teamBId);

    if (teamA && teamB) {
      // Notify Captain A
      await Notification.create({
        user: teamA.createdBy,
        title: "Match Scheduled ⚔️",
        message: `Your match vs ${teamB.name} is set for ${new Date(startTime).toLocaleString()} at ${venue}.`,
        type: "INFO",
      });
      // Notify Captain B
      await Notification.create({
        user: teamB.createdBy,
        title: "Match Scheduled ⚔️",
        message: `Your match vs ${teamA.name} is set for ${new Date(startTime).toLocaleString()} at ${venue}.`,
        type: "INFO",
      });
    }
    // -------------------------------------

    res.status(201).json(newMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /matches/:id/result
 * Admin declares winner -> Notifies Investors
 */
exports.updateMatchResult = async (req, res) => {
  try {
    const { matchId, winnerId, scoreA, scoreB } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.status = "COMPLETED";
    match.winner = winnerId;
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    await match.save();

    const winningBets = await Investment.find({
      match: matchId,
      team: winnerId,
    }).populate("user");

    if (winningBets.length > 0) {
      const notifs = winningBets.map((bet) => ({
        user: bet.user._id,
        title: "You Won! 💰",
        message: `Your bet on the match was successful! You earned returns based on the odds.`,
        type: "SUCCESS",
      }));
      await Notification.insertMany(notifs);
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
