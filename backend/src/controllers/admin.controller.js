const Event = require("../models/Events.model");
const Team = require("../models/Team.model");
const Match = require("../models/Match.model");

// --- EVENT MANAGEMENT ---
exports.createEvent = async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
};

exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json(event);
};

// --- TEAM MANAGEMENT ---
exports.getPendingTeams = async (req, res) => {
  const teams = await Team.find({ approved: false })
    .populate("event")
    .populate("members.user");
  res.status(200).json(teams);
};

exports.approveTeam = async (req, res) => {
  const team = await Team.findByIdAndUpdate(
    req.params.id,
    { approved: true },
    { new: true },
  );
  res.status(200).json({ message: "Team approved", team });
};

// --- MATCH MANAGEMENT ---
exports.createMatch = async (req, res) => {
  const match = await Match.create(req.body);
  res.status(201).json(match);
};

exports.startMatch = async (req, res) => {
  const match = await Match.findByIdAndUpdate(
    req.params.id,
    { status: "LIVE", startTime: Date.now() },
    { new: true },
  );
  res.status(200).json(match);
};

exports.updateScore = async (req, res) => {
  const { scoreA, scoreB } = req.body;
  const match = await Match.findByIdAndUpdate(
    req.params.id,
    { scoreA, scoreB },
    { new: true },
  );
  res.status(200).json(match);
};

exports.endMatch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { winnerId } = req.body;

    // 1. Update Match Status & Winner
    const match = await Match.findByIdAndUpdate(
      id,
      {
        status: "COMPLETED",
        endTime: Date.now(),
        winner: winnerId,
      },
      { new: true, session },
    );

    // 2. Identify and Eliminate the Loser
    // Assuming teamA and teamB are the two participants
    const loserId =
      match.teamA.toString() === winnerId.toString()
        ? match.teamB
        : match.teamA;

    await Team.findByIdAndUpdate(loserId, { isEliminated: true }, { session });

    // 3. Point Distribution Logic
    const allInvestments = await Investment.find({ match: id }).session(
      session,
    );

    const winPot = allInvestments
      .filter((inv) => inv.team.toString() === winnerId.toString())
      .reduce((sum, inv) => sum + inv.pointsInvested, 0);

    const losePot = allInvestments
      .filter((inv) => inv.team.toString() !== winnerId.toString())
      .reduce((sum, inv) => sum + inv.pointsInvested, 0);

    for (let inv of allInvestments) {
      if (inv.team.toString() === winnerId.toString()) {
        const shareOfLosePot =
          winPot > 0 ? (inv.pointsInvested / winPot) * losePot : 0;
        const totalPayout = Math.floor(inv.pointsInvested + shareOfLosePot);

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
              note: `Match winnings distribution`,
            },
          ],
          { session },
        );
      } else {
        inv.status = "LOST";
        inv.pointsWon = 0;
        await inv.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Match ended, loser eliminated, points paid.", match });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Settlement failed", error: error.message });
  }
};

/**
 * GET /admin/teams/eligible/:eventId
 * Returns teams that have NOT lost a match in this event yet
 */
exports.getEligibleTeams = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 1. Find all teams that have lost at least one match in this event
    const lostMatches = await Match.find({
      event: eventId,
      status: "COMPLETED",
    }).select("teamA teamB winner");

    const loserIds = [];
    lostMatches.forEach((m) => {
      // If teamA is not the winner, they lost
      if (m.teamA.toString() !== m.winner.toString()) loserIds.push(m.teamA);
      // If teamB is not the winner, they lost
      if (m.teamB.toString() !== m.winner.toString()) loserIds.push(m.teamB);
    });

    // 2. Find all approved teams for this event EXCEPT the losers
    const eligibleTeams = await Team.find({
      event: eventId,
      approved: true,
      _id: { $nin: loserIds }, // "Not In" the loser list
    });

    res.status(200).json(eligibleTeams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching eligible teams" });
  }
};
