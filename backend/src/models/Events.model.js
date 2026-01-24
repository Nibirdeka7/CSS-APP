const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an event name'],
    trim: true
  },

  sport: {
    type: String,
    enum: ['CRICKET', 'BADMINTON'],
    required: true
  },

  category: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OPEN'],
    required: true
  },

  type: {
    type: String,
    enum: ['SOLO', 'DUO', 'TEAM'],
    required: true
  },

  bannerImageUrl: {
    type: String,
    required: [true, 'Please add a banner image']
  },

  rules: {
    type: String,
    default: "Standard rules apply."
  },

  registrationOpen: {
    type: Boolean,
    default: true
  },

  // Constraints for Team creation
  maxTeamSize: {
    type: Number,
    required: true
  },

  minTeamSize: {
    type: Number,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  startDate: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// helper to check if registration is currently valid hoy ne nhoy
EventSchema.methods.canRegister = function() {
  return this.isActive && this.registrationOpen;
};

module.exports = mongoose.model('Event', EventSchema);