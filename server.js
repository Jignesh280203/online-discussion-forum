// server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/db");
const { protect } = require("./middleware/authMiddleware");

// Security
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();

// Trust proxy (Render)
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// Security + parsers
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
  })
);

// Static
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect DB
connectDB();

// Protect middleware (attach user if token exists)
app.use(protect);

// Make user available globally
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

/* ============================
       ROUTES REGISTRATION
   ============================ */

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const threadRoutes = require("./routes/threadRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Register routes
app.use("/", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/threads", threadRoutes);
app.use("/comments", commentRoutes);

/* ============================
       DASHBOARD ROUTES
   ============================ */

// Home Dashboard
app.get("/", (req, res) => {
  res.render("index", { title: "Dashboard" });
});

// Profile Page
app.get("/profile", protect, (req, res) => {
  res.render("profile", { title: "Your Profile" });
});

// Notifications Page
app.get("/notifications", protect, (req, res) => {
  res.render("notifications", { title: "Notifications" });
});

// Admin Page (only admin allowed)
app.get("/admin", protect, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Not authorized");
  }
  res.render("admin", { title: "Admin Dashboard" });
});

/* ============================
           ERROR HANDLERS
   ============================ */

// 404
app.use((req, res) => {
  res.status(404);
  res.render("404", { url: req.originalUrl });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  const status = err.status || 500;

  res.status(status);
  return res.render("error", {
    status,
    error: err.message || "Server error",
  });
});

/* ============================
         START SERVER
   ============================ */

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle PORT errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} already in use.`);
  } else {
    console.error(err);
  }
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}, shutting down...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
