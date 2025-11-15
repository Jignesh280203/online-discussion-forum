// routes/commentRoutes.js
const express = require("express");
const router = express.Router();

const {
  addComment,
  replyComment,
  voteComment,
  deleteComment
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

// Add comment to thread
router.post("/:threadId", protect, addComment);

// Reply to comment (Twitter-style: creates a new comment with parent set)
router.post("/reply/:commentId", protect, replyComment);

// Vote on comment (body.type = 'up' or 'down')
router.post("/vote/:commentId", protect, voteComment);

// Delete comment(s)
router.post("/delete/:commentId", protect, deleteComment);

module.exports = router;
