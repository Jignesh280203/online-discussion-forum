// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();

const getTokenFromReq = (req) => {
  // cookie token or Authorization header Bearer
  if (req.cookies && req.cookies.token) return req.cookies.token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// Attach user if token present (no failure)
exports.attachUser = async (req, res, next) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();
    if (user) req.user = user;
    return next();
  } catch (err) {
    // silent attach failure
    return next();
  }
};

// Protect: require auth, else redirect to login (for pages) or 401 for api
exports.protect = async (req, res, next) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) {
      // If expects HTML, redirect
      if (req.accepts("html")) return res.redirect("/login");
      return res.status(401).json({ message: "Not authorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) {
      if (req.accepts("html")) return res.redirect("/login");
      return res.status(401).json({ message: "Not authorized" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    if (req.accepts("html")) return res.redirect("/login");
    return res.status(401).json({ message: "Token invalid" });
  }
};

// Restrict to roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      if (req.accepts("html")) return res.status(403).send("Not authorized");
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
