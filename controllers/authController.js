// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).render("register", { error: "Missing" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).render("register", { error: "Username exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, role: role || "user" });

    const token = signToken(user._id);
    res.cookie("token", token, { httpOnly: true, maxAge: 30*24*60*60*1000 });
    res.redirect("/");
  } catch (err) {
    console.error("Register:", err);
    res.status(500).render("register", { error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).render("login", { error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).render("login", { error: "Invalid credentials" });

    const token = signToken(user._id);
    res.cookie("token", token, { httpOnly: true, maxAge: 30*24*60*60*1000 });
    res.redirect("/");
  } catch (err) {
    console.error("Login:", err);
    res.status(500).render("login", { error: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};
