// server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/db");

// Security
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();

/* ============================
        TRUST PROXY
============================= */
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

/* ============================
        SECURITY + PARSERS
============================= */
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ============================
        RATE LIMIT
============================= */
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: "Too many requests, please try again later.",
  })
);

/* ============================
        STATIC FILES
============================= */
app.use(express.static(path.join(__dirname, "public")));

/* ============================
        VIEW ENGINE
============================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ============================
        CONNECT DATABASE
============================= */
connectDB();

/* ============================
        AUTH MIDDLEWARE
============================= */
const { protect, attachUser } = require("./middleware/authMiddleware");

// Attach user if token exists
app.use(attachUser);

// Make user available to all EJS views
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

/* ============================
        ROUTES REGISTRATION
============================= */
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const threadRoutes = require("./routes/threadRoutes");
const commentRoutes = require("./routes/commentRoutes");
const { dashboard } = require("./controllers/homeController");

// Dashboard Home Route
app.get("/", dashboard);

// Auth + Main Routes
app.use("/", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/threads", threadRoutes);
app.use("/comments", commentRoutes);

/* ============================
        PROTECTED ROUTES
============================= */
app.get("/profile", protect, (req, res) => {
  res.render("profile", { title: "Your Profile" });
});

app.get("/notifications", protect, (req, res) => {
  res.render("notifications", { title: "Notifications" });
});

app.get("/admin", protect, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Not authorized");
  }
  res.render("admin", { title: "Admin Dashboard" });
});

/* ============================
        ERROR HANDLERS
============================= */
app.use((req, res) => {
  res.status(404).render("404", { url: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).render("error", {
    status: 500,
    error: err.message || "Server Error",
  });
});

/* ============================
        START SERVER
============================= */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Port error handler
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} already in use.`);
  } else {
    console.error(err);
  }
});

// Graceful shutdown
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
