// server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/db");
const { protect } = require("./middleware/authMiddleware");

// Security & dev tools
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Optional: flash messages (uncomment if you want flash)
const session = require("express-session");
const flash = require("connect-flash");

dotenv.config();
const app = express();

// Trust proxy if deployed behind a proxy/load balancer (Render, Heroku, etc.)
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// Middleware: security, logging, parsing
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiter (basic)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Static
app.use(express.static(path.join(__dirname, "public")));

// Optional: Express-session + flash (useful for server-side messages)
// Uncomment the block below if you installed express-session & connect-flash
/*
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "forumSecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // secure cookie in production (HTTPS)
    sameSite: "lax"
  }
}));
app.use(flash());

// Make flash available in templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});
*/

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect DB
connectDB();

// Protect middleware (attach req.user if token present)
app.use(protect);

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const threadRoutes = require("./routes/threadRoutes");

// Mount routes
app.use("/threads", threadRoutes);
app.use("/", authRoutes);
app.use("/categories", categoryRoutes);

// Home route (kept after authRoutes so auth endpoints work)
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404);
  // respond with html page
  if (req.accepts("html")) {
    return res.render("404", { url: req.originalUrl });
  }
  // respond with json
  if (req.accepts("json")) {
    return res.json({ error: "Not found" });
  }
  // default plain-text
  res.type("txt").send("Not found");
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  const status = err.status || 500;
  res.status(status);
  // return JSON for API endpoints
  if (req.accepts("json") && !req.accepts("html")) {
    return res.json({ error: err.message || "Server error" });
  }
  // else render an error page (create views/error.ejs if you like)
  return res.render("error", { error: err, status });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} (env=${process.env.NODE_ENV || "dev"})`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}, closing server...`);
  server.close(() => {
    console.log("Server closed.");
    // close DB connection if needed
    process.exit(0);
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
