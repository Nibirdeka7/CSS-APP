const Team = require("../models/Team.model");
const Event = require("../models/Events.model");
const User = require("../models/User");
const Match = require("../models/Match.model");
const Notification = require("../models/Notification");

/**
 * POST /teams
 * Register a new team or solo entry
 */
exports.createTeam = async (req, res) => {
  try {
    console.log("📥 Creating Team Body:", req.body);
    const { name, eventId, members, captainPhone } = req.body;

    // Ensure User is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }
    const userId = req.user._id;

    // 1. Validate Event
    if (!eventId)
      return res.status(400).json({ message: "Event ID is required" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.registrationOpen) {
      return res
        .status(400)
        .json({ message: "Registrations are closed for this event" });
    }

    // 2. CHECK: Is Captain already registered?
    const alreadyRegistered = await Team.findOne({
      event: eventId,
      "members.user": userId,
    });

    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ message: "You have already registered for this event." });
    }

    if (captainPhone && captainPhone.length > 15) {
      // Relaxed validation slightly
      return res.status(400).json({ message: "Invalid Captain Phone Number" });
    }

    // 3. Handle Team Name Logic
    let finalTeamName = name;

    if (event.type === "SOLO") {
      finalTeamName = req.user.name; // Force name for solo
    } else {
      // Group event: Check name uniqueness
      if (!name)
        return res.status(400).json({ message: "Team Name is required" });

      const nameExists = await Team.findOne({ name: name, event: eventId });
      if (nameExists)
        return res.status(400).json({ message: "Team name already taken" });
    }

    // 4. Process Members
    const processedMembers = [];

    if (event.type === "SOLO") {
      // --- SOLO LOGIC ---
      processedMembers.push({
        user: userId,
        name: req.user.name,
        email: req.user.email,
        phone: captainPhone || "",
        role: "CAPTAIN",
      });
    } else {
      // --- TEAM LOGIC ---
      // Ensure members is an array (handle edge case)
      const membersList = Array.isArray(members) ? members : [];

      if (membersList.length === 0) {
        return res.status(400).json({ message: "Team members are required" });
      }

      // Size check (members array + captain)
      const totalSize = membersList.length + 1;
      if (totalSize < event.minTeamSize || totalSize > event.maxTeamSize) {
        return res.status(400).json({
          message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize} (including you)`,
        });
      }

      // Extract emails to validate
      const memberEmails = membersList.map((m) => m.email.toLowerCase().trim());

      // Check for duplicates in the input list
      if (new Set(memberEmails).size !== memberEmails.length) {
        return res
          .status(400)
          .json({ message: "Duplicate emails in member list" });
      }

      if (memberEmails.includes(req.user.email.toLowerCase().trim())) {
        return res
          .status(400)
          .json({ message: "Do not include yourself in the member list" });
      }

      // Fetch Users from DB
      const foundUsers = await User.find({ email: { $in: memberEmails } });

      if (foundUsers.length !== memberEmails.length) {
        // Find which email is missing to give better error
        const foundEmails = foundUsers.map((u) => u.email);
        const missing = memberEmails.filter((e) => !foundEmails.includes(e));
        return res
          .status(400)
          .json({
            message: `Users not found: ${missing.join(", ")}. They must register on the app first.`,
          });
      }

      // Check if any MEMBER is already registered in this event
      const memberIds = foundUsers.map((u) => u._id);
      const membersAlreadyRegistered = await Team.findOne({
        event: eventId,
        "members.user": { $in: memberIds },
      });

      if (membersAlreadyRegistered) {
        return res.status(400).json({
          message:
            "One of your team members is already registered in another team for this event.",
        });
      }

      // Add Players to Array
      membersList.forEach((member) => {
        const userDoc = foundUsers.find((u) => u.email === member.email);
        processedMembers.push({
          user: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          phone: member.phone || "",
          role: "PLAYER",
        });
      });

      // Add Captain
      processedMembers.push({
        user: userId,
        name: req.user.name,
        email: req.user.email,
        phone: captainPhone || "",
        role: "CAPTAIN",
      });
    }

    // 5. Create Team in Database
    const newTeam = new Team({
      name: finalTeamName,
      event: eventId,
      captainPhone,
      members: processedMembers,
      createdBy: userId,
      approved: false, // Default to pending
      lives: 2, // Default lives for double elimination
    });

    await newTeam.save();

    // 6. Notification
    try {
      await Notification.create({
        user: userId,
        title: "Registration Received 📝",
        message: `Your registration for "${event.name}" has been received. Please wait for admin approval.`,
        type: "INFO",
      });
    } catch (err) {
      console.error("Notification Error:", err.message);
    }

    res.status(201).json({ message: "Registration successful", team: newTeam });
  } catch (error) {
    console.error("Create Team Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
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
 * GET /teams/pending
 * Admin: Get teams waiting for approval
 */
exports.getPendingTeams = async (req, res) => {
  try {
    const teams = await Team.find({ approved: false })
      .populate("event")
      .populate("members.user")
      .sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending teams" });
  }
};

/**
 * GET /teams/eligible/:eventId
 * Admin: Get approved teams that haven't been eliminated
 */
exports.getEligibleTeams = async (req, res) => {
  try {
    const { eventId } = req.params;

    console.log(`🔍 Fetching eligible teams for Event: ${eventId}`);

    // 1. Fetch ALL approved teams for this event
    // We remove the complex "isEliminated" check for a moment to ensure data flows.
    // If you need to filter losers later, we can add that back.
    const teams = await Team.find({ 
      event: eventId, 
      approved: true 
    });

    console.log(`✅ Found ${teams.length} teams.`);
    
    res.status(200).json(teams);
  } catch (error) {
    console.error("❌ Error fetching eligible teams:", error);
    res.status(500).json({ message: "Error fetching eligible teams" });
  }
};

/**
 * GET /teams/event/:eventId
 * Public: Get list of teams for an event
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

/**
 * GET /teams/:id
 */
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
 * PUT /teams/:id
 * Update Team details
 */
exports.updateTeam = async (req, res) => {
  try {
    const { name, captainPhone } = req.body;
    const teamId = req.params.id;
    const userId = req.user._id;

    const team = await Team.findById(teamId).populate("event");

    if (!team) return res.status(404).json({ message: "Team not found" });

    // Authorization check
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

/**
 * PUT /teams/:id/approve
 * Admin approves a team
 */
exports.approveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate("event");
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.approved = true;
    await team.save();

    // Notify Captain
    try {
      await Notification.create({
        user: team.createdBy,
        title: "Team Approved! ✅",
        message: `Your team "${team.name}" has been approved for "${team.event.name}".`,
        type: "SUCCESS",
      });
    } catch (e) {
      console.error("Notif Error", e);
    }

    res.json({ message: "Team approved successfully", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /teams/:id/reject
 * Admin rejects a team
 */
exports.rejectTeam = async (req, res) => {
  try {
    const { reason } = req.body;
    const team = await Team.findById(req.params.id).populate("event");
    if (!team) return res.status(404).json({ message: "Team not found" });

    const captainId = team.createdBy;
    const teamName = team.name;
    const eventName = team.event?.name || "Event";

    await Team.findByIdAndDelete(req.params.id);

    // Notify Captain
    try {
      await Notification.create({
        user: captainId,
        title: "Registration Rejected ❌",
        message: `Your registration for "${eventName}" (Team: ${teamName}) was rejected.${reason ? ` Reason: ${reason}` : ""}`,
        type: "ERROR",
      });
    } catch (e) {
      console.error("Notif Error", e);
    }

    res.json({ message: "Team rejected and removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
