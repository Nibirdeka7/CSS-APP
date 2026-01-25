const Team = require("../models/Team.model.js");
const Event = require("../models/Events.model.js");
const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * POST /teams
 * Register a new team or solo entry
 */
exports.createTeam = async (req, res) => {
  try {
    const { name, eventId, members, captainPhone } = req.body;
    const userId = req.user._id;

    // Fetch Event Details
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.registrationOpen)
      return res.status(400).json({ message: "Registrations are closed" });

    // CHECK IF USER IS ALREADY REGISTERED
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
      finalTeamName = req.user.name;
    } else {
      if (!name)
        return res.status(400).json({ message: "Team Name is required" });
      const nameExists = await Team.findOne({ name: name, event: eventId });
      if (nameExists)
        return res.status(400).json({ message: "Team name taken" });
    }

    // Member Validation
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
      if (!members || members.length === 0) {
        return res.status(400).json({ message: "Members are required" });
      }

      const totalSize = members.length + 1;
      if (totalSize < event.minTeamSize || totalSize > event.maxTeamSize) {
        return res.status(400).json({
          message: `Total team size must be between ${event.minTeamSize} and ${event.maxTeamSize} (including you)`,
        });
      }

      const emails = members.map((m) => m.email);
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

      processedMembers.push({
        user: userId,
        name: req.user.name,
        email: req.user.email,
        phone: captainPhone || "",
        role: "CAPTAIN",
      });
    }

    // Create Team
    const newTeam = new Team({
      name: finalTeamName,
      event: eventId,
      captainPhone,
      members: processedMembers,
      createdBy: userId,
      approved: false,
    });

    await newTeam.save();
    await Notification.create({
      user: userId,
      title: "Registration Received 📝",
      message: `Your registration for "${event.name}" has been received. Please wait for admin approval.`,
      type: "INFO",
    });

    res.status(201).json({ message: "Registration successful", team: newTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * GET /teams/my
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

    if (team.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!team.event.registrationOpen) {
      return res.status(400).json({ message: "Registration is closed" });
    }

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

/**
 * PUT /teams/:id/approve
 * Admin approves a team -> Triggers Notification
 */
exports.approveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate("event");
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.approved = true;
    await team.save();
    console.log("Attempting to notify user:", team.createdBy);
    await Notification.create({
      user: team.createdBy,
      title: "Team Approved! ✅",
      message: `Your team "${team.name}" has been approved for "${team.event.name}". You are ready to play!`,
      type: "SUCCESS",
    });

    res.json({ message: "Team approved successfully", team });
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /teams/:id/reject
 * Admin rejects a team -> Triggers Notification
 */
exports.rejectTeam = async (req, res) => {
  try {
    const { reason } = req.body; 
    const team = await Team.findById(req.params.id).populate("event");
    if (!team) return res.status(404).json({ message: "Team not found" });

    const captainId = team.createdBy;
    const teamName = team.name;
    const eventName = team.event.name;

    await Team.findByIdAndDelete(req.params.id);

    await Notification.create({
      user: captainId,
      title: "Registration Rejected ❌",
      message: `Your registration for "${eventName}" (Team: ${teamName}) was rejected.${
        reason ? ` Reason: ${reason}` : ""
      }`,
      type: "ERROR",
    });

    res.json({ message: "Team rejected and removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
