require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const { ipRateLimit } = require("./middleware/rateLimit.middleware.js");
const errorHandler = require("./middleware/error.middleware.js");

const authRoutes = require("./routes/auth.routes.js");
const adminRoutes = require("./routes/admin.rotues.js");
const eventRoutes = require("./routes/event.routes");
const matchRoutes = require("./routes/match.route.js");
const teamRoutes = require("./routes/team.route.js");
const transactionRoutes = require("./routes/transaction.route.js");
const investmentRoutes = require("./routes/investment.route.js");
const leaderboardRoutes   = require("./routes/leaderboard.routes.js");
const userRoutes = require("./routes/user.routes.js");
const notificationRoutes = require("./routes/notification.routes");
const postRoutes = require("./routes/post.route.js");
const commentRoutes = require("./routes/comment.route.js");

const app = express();

const allowedOrigins = [
  "https://css-olympics.css-nits.in",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, ""));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/+$/, "");

    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith(".css-nits.in") ||
      cleanOrigin.endsWith(".nits.ac.in") ||
      /^http:\/\/localhost:\d+$/.test(cleanOrigin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(cleanOrigin)
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// In Express 5, regex path is used instead of wildcard string for explicit options handler
app.options(/.*/, cors(corsOptions));

app.use(express.json());

// Apply rate limiting to all requests
app.use(ipRateLimit());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/investment", investmentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Health check
app.get("/", (req, res) => {
  res.send("Google Auth API Running ");
});

(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("🔥 DB connection failed on startup:", err);
    throw err;
  }
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

module.exports = app;
