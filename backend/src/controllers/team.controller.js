const Team = require('../models/Team'); // Path to your Team model
const Event = require('../models/Event');
const User = require('../models/User');

/**
 * POST /teams
 * Register a new team or solo entry
 */
exports.createTeam = async (req, res) => {
  try {
    const { name, eventId, members } = req.body;
    const userId = req.user._id; // Assuming user info is in req.user from auth middleware

    // 1. Fetch Event Details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.registrationOpen) {
      return res.status(400).json({ message: "Registrations are closed for this event" });
    }

    // 2. Handle Team Name Uniqueness
    // For SOLO events, if no name is provided, we use the user's name
    let finalTeamName = name;
    if (event.type === 'SOLO' && !name) {
      finalTeamName = req.user.name;
    }

    const existingTeam = await Team.findOne({ name: finalTeamName, event: eventId });
    if (existingTeam) {
      return res.status(400).json({ message: "Team name already exists for this event" });
    }

    // 3. Member Validation
    const processedMembers = [];

    if (event.type === 'SOLO') {
      // For Solo, the creator is the only member
      processedMembers.push({
        user: userId,
        name: req.user.name,
        email: req.user.email,
        phone: req.body.captainPhone || "",
        role: 'CAPTAIN'
      });
    } else {
      // For DUO or TEAM (e.g., Cricket)
      if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: "Members are required for team events" });
      }

      // Check size constraints
      if (members.length < event.minTeamSize || members.length > event.maxTeamSize) {
        return res.status(400).json({ 
          message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}` 
        });
      }

      // Validate all member emails exist in DB
      const emails = members.map(m => m.email);
      const foundUsers = await User.find({ email: { $in: emails } });

      if (foundUsers.length !== emails.length) {
        return res.status(400).json({ 
          message: "All team members must be registered on the platform first using their college email id." 
        });
      }

      // Map found users to the schema format
      members.forEach(member => {
        const userDoc = foundUsers.find(u => u.email === member.email);
        processedMembers.push({
          user: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          phone: member.phone,
          role: member.role || 'PLAYER'
        });
      });
    }

    // 4. Create the Team
    const newTeam = new Team({
      name: finalTeamName,
      event: eventId,
      captainPhone: req.body.captainPhone,
      jerseyColor,
      teamLogoUrl,
      members: processedMembers,
      createdBy: userId,
      approved: false // Pending admin approval
    });

    await newTeam.save();
    res.status(201).json({ message: "Registration successful", team: newTeam });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * GET /teams/my
 * Get teams the logged-in user belongs to
 */
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ "members.user": req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your teams" });
  }
};

/**
 * GET /teams/event/:eventId
 * Get all approved teams for a specific event (Public/Admin view)
 */
exports.getTeamsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const teams = await Team.find({ event: eventId, approved: true })
      .populate('members.user', 'name email');
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event teams" });
  }
};