// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Render register page
exports.getRegister = (req, res) => {
  return res.render("register", { error: null });
};

// Render login page
exports.getLogin = (req, res) => {
  return res.render("login", { error: null });
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).render("register", { error: "All fields are required." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).render("register", { error: "Email or username already in use." });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    // Redirect to login after successful registration
    return res.redirect("/login");
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).render("register", { error: "Server error. Try again." });
  }
};

// Login user and set JWT cookie
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).render("login", { error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).render("login", { error: "Invalid email or password." });
    }

    // Use model method if present, otherwise fallback to bcrypt
    let isMatch = false;
    if (typeof user.matchPassword === "function") {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).render("login", { error: "Invalid email or password." });
    }

    // Create token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in .env");
      return res.status(500).render("login", { error: "Server configuration error." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set cookie (httpOnly)
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // enable on HTTPS
      // sameSite: 'strict'
    });

    return res.redirect("/");
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).render("login", { error: "Server error. Try again." });
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  try {
    res.clearCookie("token");
    return res.redirect("/login");
  } catch (err) {
    console.error("logoutUser error:", err);
    return res.status(500).send("Server error while logging out");
  }
};
