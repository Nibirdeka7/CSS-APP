require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes.js");
const adminRoutes = require("./routes/admin.rotues.js");
const eventRoutes = require("./routes/event.routes");
const matchRoutes = require("./routes/match.route.js");
const teamRoutes = require("./routes/team.route.js");
const transactionRoutes = require("./routes/transaction.route.js");
const investmentRoutes = require("./routes/investment.route.js");

const app = express();

// Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://css-app-iota.vercel.app"
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/investment", investmentRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Google Auth API Running ");
});

// Start server
connectDB();
const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`),
// );

module.exports = app;