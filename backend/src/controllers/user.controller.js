const User = require("../models/User");

// PATCH /api/users/me
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { scholarId } = req.body;

    // Basic validation
    if (!scholarId) {
      return res.status(400).json({ message: "Scholar ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { scholarId },
      { new: true } // Return the updated document
    ).select("-googleId"); // Exclude sensitive fields if necessary

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};