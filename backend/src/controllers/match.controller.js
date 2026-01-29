const mongoose = require("mongoose");
const Match = require("../models/Match.model");
const Investment = require("../models/Investment.model");
const Team = require("../models/Team.model");
const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction.model");
const User = require("../models/User");
const redis = require("../config/redis");

// --- PUBLIC GETTERS ---

exports.getMatchesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `matches:${eventId}`;

    const cachedMatches = await redis.get(cacheKey);
    if (cachedMatches) {
      return res.status(200).json(cachedMatches);
    }
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

exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `match:details:${id}`;

    const cachedMatch = await redis.get(cacheKey);
    if (cachedMatch) {
      return res.status(200).json(cachedMatch);
    }
    const match = await Match.findById(id)
      .populate("event", "name sport")
      .populate("teamA")
      .populate("teamB")
      .populate("winner", "name");
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMatchStats = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `match:stats:${id}`;

    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) {
      return res.status(200).json(cachedStats);
    }
    const stats = await Investment.aggregate([
      { $match: { match: new mongoose.Types.ObjectId(id) } },
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
    await redis.set(cacheKey, response, "EX", 300); 
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error calculating stats", error: error.message });
  }
};

// --- ADMIN ACTIONS ---

exports.createMatch = async (req, res) => {
  try {
    console.log("📥 Creating Match:", req.body);

    // Extract everything safely
    const {
      event,
      eventId,
      teamA,
      teamAId,
      teamB,
      teamBId,
      startTime,
      venue,
      round,
    } = req.body;

    // ✅ FIX: Prioritize the ID fields and ignore empty strings
    const finalEventId = eventId && eventId !== "" ? eventId : event;
    const finalTeamA = teamAId && teamAId !== "" ? teamAId : teamA;
    const finalTeamB = teamBId && teamBId !== "" ? teamBId : teamB;

    // Validation
    if (!finalEventId || !finalTeamA || !finalTeamB) {
      return res
        .status(400)
        .json({ message: "Event, Team A, and Team B are required." });
    }

    const newMatch = new Match({
      event: finalEventId,
      teamA: finalTeamA,
      teamB: finalTeamB,
      startTime,
      venue,
      round: round || "NONE",
      status: "UPCOMING",
    });

    await newMatch.save();

    // Notify Captains
    try {
      const tA = await Team.findById(finalTeamA);
      const tB = await Team.findById(finalTeamB);
      if (tA && tB) {
        const msg = `Match Scheduled: ${tA.name} vs ${tB.name} at ${venue}`;
        await Notification.create({
          user: tA.createdBy,
          title: "Match Scheduled ⚔️",
          message: msg,
          type: "INFO",
        });
        await Notification.create({
          user: tB.createdBy,
          title: "Match Scheduled ⚔️",
          message: msg,
          type: "INFO",
        });
      }
    } catch (e) {
      console.error("Notif Error:", e.message);
    }

    res.status(201).json(newMatch);
  } catch (error) {
    console.error("Create Match Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.startMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { status: "LIVE" },
      { new: true },
    ).populate("teamA teamB");
    if (!match) return res.status(404).json({ message: "Match not found" });

    await redis.del(`match:details:${req.params.id}`);
    await redis.del(`matches:list:${match.event._id}`);
    await redis.del(`matches:list:all`);

    try {
      const msg = `Match LIVE: ${match.teamA.name} vs ${match.teamB.name}`;
      await Notification.create({
        user: match.teamA.createdBy,
        title: "Match LIVE 🔴",
        message: msg,
        type: "INFO",
      });
      await Notification.create({
        user: match.teamB.createdBy,
        title: "Match LIVE 🔴",
        message: msg,
        type: "INFO",
      });
    } catch (e) {
      console.error("Notif Error:", e.message);
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const { scoreA, scoreB } = req.body;
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { scoreA, scoreB },
      { new: true },
    );
    await redis.del(`match:details:${req.params.id}`);
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * End Match (Parimutuel Logic + Notifications)
 */
exports.endMatch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { winnerId } = req.body;

    const match = await Match.findById(id).session(session);
    if (!match) throw new Error("Match not found");

    match.status = "COMPLETED";
    match.endTime = Date.now();
    match.winner = winnerId;
    await match.save({ session });

    // Tournament Bracket Logic
    const currentRound = match.round;
    await Team.findByIdAndUpdate(
      winnerId,
      {
        highestRoundReached:
          currentRound === "FINALS" ? "CHAMPION" : currentRound,
        $set: { ranking: currentRound === "FINALS" ? 1 : null },
      },
      { session },
    );

    const loserId =
      match.teamA.toString() === winnerId.toString()
        ? match.teamB
        : match.teamA;
    const loserTeam = await Team.findById(loserId).session(session);
    loserTeam.lives -= 1;
    if (loserTeam.lives <= 0) {
      loserTeam.isEliminated = true;
      if (currentRound === "FINALS") {
        loserTeam.ranking = 2;
        loserTeam.highestRoundReached = "FINALS";
      }
    }
    await loserTeam.save({ session });

    // Payout Logic
    const allInvestments = await Investment.find({ match: id }).session(
      session,
    );
    const winPot = allInvestments
      .filter((i) => i.team.toString() === winnerId.toString())
      .reduce((sum, i) => sum + i.pointsInvested, 0);
    const losePot = allInvestments
      .filter((i) => i.team.toString() !== winnerId.toString())
      .reduce((sum, i) => sum + i.pointsInvested, 0);

    const notifications = [];

    for (let inv of allInvestments) {
      if (inv.team.toString() === winnerId.toString()) {
        const share = winPot > 0 ? (inv.pointsInvested / winPot) * losePot : 0;
        const totalPayout = Math.floor(inv.pointsInvested + share);

        inv.status = "WON";
        inv.pointsWon = totalPayout;
        await inv.save({ session });

        await User.findByIdAndUpdate(
          inv.user,
          { $inc: { points: totalPayout } },
          { session },
        );

        await Transaction.create(
          [
            {
              user: inv.user,
              type: "WIN",
              points: totalPayout,
              match: id,
              note: "Match Winnings",
            },
          ],
          { session },
        );

        notifications.push({
          user: inv.user,
          title: "You Won! 💰",
          message: `You won ${totalPayout} points!`,
          type: "SUCCESS",
        });
      } else {
        inv.status = "LOST";
        inv.pointsWon = 0;
        await inv.save({ session });
      }
    }

    await session.commitTransaction();

    if (notifications.length > 0) {
      try {
        await Notification.insertMany(notifications);
      } catch (e) {
        console.error("Notif Error", e);
      }
    }

    res.status(200).json({ message: "Match ended and settled", match });
  } catch (error) {
    await session.abortTransaction();
    console.error("End Match Error:", error);
    res
      .status(500)
      .json({ message: "Settlement failed", error: error.message });
  } finally {
    session.endSession();
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Match deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Map legacy function name to the main one
exports.updateMatchResult = exports.endMatch;
