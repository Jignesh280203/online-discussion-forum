const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔹 Middleware 1 — Attach user if token exists (public pages allowed)
exports.attachUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

// 🔹 Middleware 2 — Ensure login required
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) return res.redirect("/login");

    next();
  } catch (err) {
    return res.redirect("/login");
  }
};

// 🔹 Middleware 3 — Restrict by role (admin, moderator, etc.)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.redirect("/login");

    if (!roles.includes(req.user.role)) {
      return res.status(403).render("error", {
        status: 403,
        error: "You are not authorized for this action",
      });
    }
    next();
  };
};
