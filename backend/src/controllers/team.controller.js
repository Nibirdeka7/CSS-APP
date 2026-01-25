const Team = require("../models/Team.model.js"); // Path to your Team model
const Event = require("../models/Events.model.js");
const User = require("../models/User");

/**
 * POST /teams
 * Register a new team or solo entry
 */
exports.createTeam = async (req, res) => {
  try {
    const { name, eventId, members, captainPhone } = req.body;
    const userId = req.user._id;

    // 1. Fetch Event Details
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.registrationOpen)
      return res.status(400).json({ message: "Registrations are closed" });

    // 2. CHECK IF USER IS ALREADY REGISTERED FOR THIS EVENT
    // We check if the current user exists in the 'members.user' field of ANY team for this event
    const alreadyRegistered = await Team.findOne({
      event: eventId,
      "members.user": userId,
    });

    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ message: "You have already registered for this event." });
    }
    if (captainPhone.length > 10) {
      return res.status(400).json({ message: "Invalid Captain Phone Number" });
    }
    // 3. Handle Team Name Uniqueness
    let finalTeamName = name;
    if (event.type === "SOLO") {
      finalTeamName = req.user.name; // Force name for solo
    } else {
      // Group event: Check name uniqueness
      if (!name)
        return res.status(400).json({ message: "Team Name is required" });
      const nameExists = await Team.findOne({ name: name, event: eventId });
      if (nameExists)
        return res.status(400).json({ message: "Team name taken" });
    }

    // 4. Member Validation
    const processedMembers = [];

    if (event.type === "SOLO") {
      processedMembers.push({
        user: userId,
        name: req.user.name,
        email: req.user.email,
        phone: captainPhone || "",
        role: "CAPTAIN",
      });
    } else {
      // TEAM/DUO Logic
      if (!members || members.length === 0) {
        return res.status(400).json({ message: "Members are required" });
      }

      // Size check (members array + captain)
      const totalSize = members.length + 1; // +1 because req.user is Captain
      if (totalSize < event.minTeamSize || totalSize > event.maxTeamSize) {
        return res.status(400).json({
          message: `Total team size must be between ${event.minTeamSize} and ${event.maxTeamSize} (including you)`,
        });
      }

      // Validate Emails
      const emails = members.map((m) => m.email);
      // Check for duplicates in the provided list
      if (new Set(emails).size !== emails.length) {
        return res
          .status(400)
          .json({ message: "Duplicate emails in member list" });
      }
      if (emails.includes(req.user.email)) {
        return res
          .status(400)
          .json({ message: "Do not include yourself in the member list" });
      }

      const foundUsers = await User.find({ email: { $in: emails } });
      if (foundUsers.length !== emails.length) {
        return res
          .status(400)
          .json({ message: "Some members are not registered on the app yet." });
      }

      // Check if any MEMBER is already registered
      const memberIds = foundUsers.map((u) => u._id);
      const membersAlreadyRegistered = await Team.findOne({
        event: eventId,
        "members.user": { $in: memberIds },
      });
      if (membersAlreadyRegistered) {
        return res.status(400).json({
          message:
            "One of your team members is already registered in another team.",
        });
      }

      // Add Members
      members.forEach((member) => {
        const userDoc = foundUsers.find((u) => u.email === member.email);
        processedMembers.push({
          user: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          phone: member.phone || "",
          role: "PLAYER",
        });
      });

      // Add Captain (Current User)
      processedMembers.push({
        user: userId,
        name: req.user.name,
        email: req.user.email,
        phone: captainPhone || "",
        role: "CAPTAIN",
      });
    }

    // 5. Create Team
    const newTeam = new Team({
      name: finalTeamName,
      event: eventId,
      captainPhone,
      members: processedMembers,
      createdBy: userId,
      approved: false,
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
      .populate("event")
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
    const teams = await Team.find({ event: eventId, approved: true }).populate(
      "members.user",
      "name email",
    );
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event teams" });
  }
};


exports.updateTeam = async (req, res) => {
  try {
    const { name, captainPhone, members } = req.body;
    const teamId = req.params.id;
    const userId = req.user._id;

    const team = await Team.findById(teamId).populate("event");

    if (!team) return res.status(404).json({ message: "Team not found" });

    // Authorization check: Only creator/captain can update
    if (team.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if open
    if (!team.event.registrationOpen) {
      return res.status(400).json({ message: "Registration is closed" });
    }

    // Logic to update fields
    team.name = name || team.name;
    team.captainPhone = captainPhone || team.captainPhone;
    await team.save();
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("event")
      .populate("members.user");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};