const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware to check login status
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      req.user = null;
      return next(); // continue as guest
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    req.user = null;
    next();
  }
};

// ✅ Restrict access based on user role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).send("❌ Access Denied — Moderator/Admin only");
    }
    next();
  };
};
