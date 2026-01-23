const Event = require("../models/Event");

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

//  ADMIN FUNCTIONS

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
    // Deactivating instead of removing from DB . Not permanently deleting
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
