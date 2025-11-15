// routes/threadRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllThreads,
  createThread,
  viewThread,
  voteThread,
  deleteThread
} = require("../controllers/threadController");

const { protect } = require("../middleware/authMiddleware");

// Show all threads
router.get("/", getAllThreads);

// Create a thread (must be logged in)
router.post("/", protect, createThread);

// View a single thread (and comments)
router.get("/:id", viewThread);

// Vote on a thread (up/down via req.body.type 'up'|'down')
router.post("/:id/vote", protect, voteThread);

// Delete thread (author, moderator, admin)
router.post("/:id/delete", protect, deleteThread);

module.exports = router;
