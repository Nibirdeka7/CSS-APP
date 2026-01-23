const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: ["INVEST", "WIN", "ADMIN_ADJUST"],
    required: true,
  },

  points: {
    type: Number,
    required: true,
  },

  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
  },

  note: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
