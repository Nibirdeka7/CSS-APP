require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");

const authRoutes = require("./routes/auth.routes.js");
const adminRoutes = require("./routes/admin.rotues.js");
const eventRoutes = require("./routes/event.routes");
const matchRoutes = require("./routes/match.route.js");
const teamRoutes = require("./routes/team.route.js");
const transactionRoutes = require("./routes/transaction.route.js");
const investmentRoutes = require("./routes/investment.route.js");
const { job } = require("./config/cron.js");
const app = express();

// Middleware
job.start();
app.use(cors());

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
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

module.exports = app;