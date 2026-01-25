const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-z0-9_]+@cse\.nits\.ac\.in$/,
      "(Bhai/Behen) only CSE students allowed he ",
    ],
  },

  googleId: {
    type: String,
    unique: true,
    required: true,
  },

  profilePicture: {
    type: String,
    default: "",
  },


  points: {
    type: Number,
    default: 1000,
  },

  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
  scholarId: {
    type: String,
    default: "",
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
