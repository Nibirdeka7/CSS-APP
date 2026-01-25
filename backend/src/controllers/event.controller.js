const Event = require("../models/Events.model");
const User = require("../models/User");
const Notification = require("../models/Notification");

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { sport, type } = req.query;
    let query = { isActive: true };
    if (sport) query.sport = sport.toUpperCase();
    if (type) query.type = type.toUpperCase();
    const events = await Event.find(query).sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN FUNCTIONS =================

// POST /api/admin/events
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      sport,
      category,
      type,
      bannerImageUrl,
      rules,
      maxTeamSize,
      minTeamSize,
      startDate,
    } = req.body;

    if (minTeamSize > maxTeamSize) {
      return res.status(400).json({
        message: "Min team size cannot be greater than max team size",
      });
    }

    const event = await Event.create({
      name,
      sport,
      category,
      type,
      bannerImageUrl,
      rules,
      maxTeamSize,
      minTeamSize,
      startDate,
    });

    // --- NOTIFICATION: NEW EVENT ---
    // Notify ALL users that a new event is open
    const allUsers = await User.find({}, "_id"); // Fetch only IDs for speed

    if (allUsers.length > 0) {
      const notifications = allUsers.map((user) => ({
        user: user._id,
        title: "New Event! 🏆",
        message: `${event.name} (${event.sport}) is now open for registration. Tap to check details!`,
        type: "INFO",
      }));

      await Notification.insertMany(notifications);
    }
    // -------------------------------

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/admin/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/admin/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: false, registrationOpen: false },
      { new: true },
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deactivated successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
