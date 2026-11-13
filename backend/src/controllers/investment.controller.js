/**
 * Points investment logic has been removed as per specification.
 * Returning empty/safe responses for legacy compatibility.
 */
exports.createInvestment = async (req, res) => {
  return res.status(400).json({
    message: "Point investment has been deprecated and disabled in this system.",
    success: false,
  });
};

exports.getMyInvestments = async (req, res) => {
  return res.status(200).json([]);
};

exports.getInvestmentsByMatch = async (req, res) => {
  return res.status(200).json([]);
};

exports.getMatchStats = async (req, res) => {
  return res.status(200).json({
    matchId: req.params.matchId,
    teams: [],
  });
};

exports.getMatchInvestmentStats = exports.getMatchStats;
