const express = require("express");
const router = express.Router();
const {
  getRegister,
  getLogin,
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");

router.get("/register", getRegister);
router.post("/register", registerUser);

router.get("/login", getLogin);
router.post("/login", loginUser);

router.get("/logout", logoutUser);

module.exports = router;
