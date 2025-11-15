const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// LOGIN PAGE
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// LOGIN SUBMIT
router.post("/login", authController.login);

// REGISTER PAGE
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

// REGISTER SUBMIT
router.post("/register", authController.register);

// LOGOUT
router.get("/logout", authController.logout);

module.exports = router;
