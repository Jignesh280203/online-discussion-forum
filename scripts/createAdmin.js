const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

const User = require("../models/User");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const username = "Admin";
    const email = "jigneshkadam007@gmail.com";
    const password = "Varsha@143"; // change later

    // Check if admin exists
    let user = await User.findOne({ username });

    if (user) {
      console.log("⚠ Admin already exists:", user.username);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);

    user = await User.create({
      username,
      email,
      password: hashed,
      role: "admin",
    });

    console.log("✅ Admin created successfully:", user.username);
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ ERROR:", err);
    mongoose.disconnect();
  }
}

run();
