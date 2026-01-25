const Transaction = require("../models/Transaction.model.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");

/**
 * GET /transactions/my
 * Returns the point history for the logged-in user
 */
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate("match", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction history" });
  }
};

/**
 * POST /transactions/admin-adjust
 * Allows an admin to manually add/remove points (e.g., for rewards or corrections)
 */
exports.adminAdjustPoints = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { targetUserId, points, note } = req.body;

    // Update User Points
    const user = await User.findById(targetUserId).session(session);
    if (!user) throw new Error("User not found");

    user.points += points;
    await user.save({ session });

    // Create Transaction Audit
    const transaction = await Transaction.create(
      [
        {
          user: targetUserId,
          type: "ADMIN_ADJUST",
          points: points,
          note: note || "Admin adjustment",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Points adjusted", newBalance: user.points });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};
