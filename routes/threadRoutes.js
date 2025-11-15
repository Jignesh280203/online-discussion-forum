const express = require("express");
const router = express.Router();
const Thread = require("../models/Thread");
const { protect } = require("../middleware/authMiddleware");
const { createThread } = require("../controllers/threadController");

// List all threads
router.get("/", async (req, res) => {
  try {
    const threads = await Thread.find()
      .populate("author", "username")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.render("threads", { title: "All Threads", threads });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading threads");
  }
});

// Create thread inside category
router.post("/:categoryId", protect, createThread);

module.exports = router;
