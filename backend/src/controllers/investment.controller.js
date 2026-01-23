const Investment = require('../models/Investment');
const User = require('../models/User');
const Match = require('../models/Match');

/**
 * POST /investments
 * Place a new investment on a team
 */
exports.createInvestment = async (req, res) => {
  try {
    const { matchId, teamId, pointsInvested } = req.body;
    const userId = req.user._id;

    // 1. Validate Match exists and is not COMPLETED
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    if (match.status === 'COMPLETED') {
      return res.status(400).json({ message: "Cannot invest in a completed match" });
    }

    // 2. Validate User points
    const user = await User.findById(userId);
    if (user.points < pointsInvested) {
      return res.status(400).json({ message: "Insufficient points balance" });
    }

    // 3. Create Investment
    const newInvestment = new Investment({
      user: userId,
      match: matchId,
      team: teamId,
      pointsInvested
    });

    // 4. Deduct points from User and Save Investment
    // Use a simple update (for production, consider a MongoDB Session/Transaction)
    user.points -= pointsInvested;
    await user.save();
    await newInvestment.save();

    res.status(201).json({ 
      message: "Investment placed successfully", 
      remainingPoints: user.points,
      investment: newInvestment 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * GET /investments/match/:matchId
 * Get all investments for a specific match (e.g., to show total pool)
 */
exports.getInvestmentsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const investments = await Investment.find({ match: matchId })
      .populate('user', 'name')
      .populate('team', 'name');
    
    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching investments" });
  }
};