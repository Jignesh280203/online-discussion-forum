const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper to send JWT cookie
function sendToken(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// GET /login (render handled by views)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Basic validation
    if (!username || !password) {
      return res.status(400).render("login", { title: "Login", error_msg: "Username and password required." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).render("login", { title: "Login", error_msg: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).render("login", { title: "Login", error_msg: "Invalid credentials." });
    }

    sendToken(res, user);
    return res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).render("error", { status: 500, error: "Login failed" });
  }
};

// POST /register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).render("register", { title: "Register", error_msg: "All fields required." });
    }

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(400).render("register", { title: "Register", error_msg: "Username or email already in use." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: "user" });

    sendToken(res, user);
    return res.redirect("/");
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).render("error", { status: 500, error: "Registration failed" });
  }
};

// GET /logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/login");
};
