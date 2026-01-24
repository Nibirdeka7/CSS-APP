const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  captainPhone: {
    type: String,
    required: true,
    maxlength: 10,
  },
  isEliminated: {
    type: Boolean,
    default: false,
  },

  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      phone: String,

      role: {
        type: String,
        enum: ["CAPTAIN", "PLAYER"],
        required: true,
      },
    },
  ],

  approved: {
    type: Boolean,
    default: false,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure team name is unique per event
TeamSchema.index({ name: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Team", TeamSchema);