const Event = require("../models/Events.model");
const User = require("../models/User");
const Notification = require("../models/Notification");
const redis = require("../config/redis");

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { sport, type } = req.query;
    const cacheKey = `events:list:${sport || 'all'}:${type || 'all'}`;
    const cachedEvents = await redis.get(cacheKey);
    if (cachedEvents) return res.status(200).json(cachedEvents);

    let query = { isActive: true };
    if (sport) query.sport = sport.toUpperCase();
    if (type) query.type = type.toUpperCase();
    const events = await Event.find(query).sort({ createdAt: -1 });

    await redis.set(cacheKey, events, { ex: 1800 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const cacheKey = `event:details:${req.params.id}`;
    const cachedEvent = await redis.get(cacheKey);
    if (cachedEvent) return res.status(200).json(cachedEvent);

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    await redis.set(cacheKey, event, { ex: 3600 });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN FUNCTIONS

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
      return res
        .status(400)
        .json({
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
    const keys = await redis.keys("events:list*");
    if(keys.length > 0) await redis.del(...keys);

    // Notify All Users
    const allUsers = await User.find({}, "_id");
    if (allUsers.length > 0) {
      const notifications = allUsers.map((user) => ({
        user: user._id,
        title: "New Event! 🏆",
        message: `${event.name} (${event.sport}) is now open for registration.`,
        type: "INFO",
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    await redis.del(`event:details:${req.params.id}`);
    const keys = await redis.keys("events:list:*");
    if (keys.length > 0) await redis.del(...keys);

    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: false, registrationOpen: false },
      { new: true },
    );
    if (!event) return res.status(404).json({ message: "Event not found" });

    await redis.del(`event:details:${req.params.id}`);
    const keys = await redis.keys("events:list:*");
    if (keys.length > 0) await redis.del(...keys);
    res.status(200).json({ message: "Event deactivated successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
