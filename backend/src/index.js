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
const allowedOrigins = [
  "http://localhost:3000",         
  "http://localhost:5173",         
  "https://css-frontend.vercel.app" 
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ important if using cookies / auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

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