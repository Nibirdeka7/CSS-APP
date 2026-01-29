const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  teamA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'LIVE', 'COMPLETED'],
    default: 'UPCOMING'
  },
  scoreA: {
    type: String 
  },
  scoreB: {
    type: String
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  referee: {
    type: String
  },
  venue: {
    type: String
  },
  round:{
    type: String
  },
  startTime: Date,
  endTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', MatchSchema);

