const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

const isAllowedEmail = (email) => /^[a-z0-9_]+@cse\.nits\.ac\.in$/.test(email);

const generateUniqueUsername = async (baseName) => {
  let name = baseName.toLowerCase();
  while (await User.findOne({ username: name })) {
    name = `${baseName}${Math.floor(Math.random() * 10000)}`;
  }
  return name;
};

exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, profilePicture } = req.body;

    if (!googleId || !email || !name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!isAllowedEmail(email)) {
      return res.status(403).json({
        success: false,
        message: "(Bhai/Behen) only CSE students allowed",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const baseUsername = email.split("@")[0];
      const username = await generateUniqueUsername(baseUsername);

      user = new User({
        googleId,
        email,
        name,
        username,
        profilePicture,
      });

      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      // basically duplicate key erroror babe aeitu
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};