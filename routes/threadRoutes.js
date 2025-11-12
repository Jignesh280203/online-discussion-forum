const express = require("express");
const router = express.Router();
const {
  viewThread,
  addComment,
  voteThread,
  deleteThread
} = require("../controllers/threadController");

// 🧵 View single thread
router.get("/:id", viewThread);

// 💬 Add comment
router.post("/:threadId/comments", addComment);

// ⬆️⬇️ Voting
router.get("/:id/vote/:type", voteThread);

// 🧰 Delete thread
const { restrictTo } = require("../middleware/authMiddleware");
router.get("/:id/delete", restrictTo("moderator", "admin"), deleteThread);

module.exports = router;
