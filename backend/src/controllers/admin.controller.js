const Event = require('../models/Event');
const Team = require('../models/Team');
const Match = require('../models/Match');

// --- EVENT MANAGEMENT ---
exports.createEvent = async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
};

exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(event);
};

// --- TEAM MANAGEMENT ---
exports.getPendingTeams = async (req, res) => {
  const teams = await Team.find({ approved: false }).populate('event').populate('members.user');
  res.status(200).json(teams);
};

exports.approveTeam = async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
  res.status(200).json({ message: "Team approved", team });
};

// --- MATCH MANAGEMENT ---
exports.createMatch = async (req, res) => {
  const match = await Match.create(req.body);
  res.status(201).json(match);
};

exports.startMatch = async (req, res) => {
  const match = await Match.findByIdAndUpdate(req.params.id, 
    { status: 'LIVE', startTime: Date.now() }, { new: true });
  res.status(200).json(match);
};

exports.updateScore = async (req, res) => {
  const { scoreA, scoreB } = req.body;
  const match = await Match.findByIdAndUpdate(req.params.id, 
    { scoreA, scoreB }, { new: true });
  res.status(200).json(match);
};

exports.endMatch = async (req, res) => {
  const { winnerId } = req.body; // Pass the Team ID of the winner
  const match = await Match.findByIdAndUpdate(req.params.id, {
    status: 'COMPLETED',
    endTime: Date.now(),
    winner: winnerId
  }, { new: true });
  
  // Note: Here you would typically trigger the points distribution logic
  res.status(200).json({ message: "Match ended", match });
};