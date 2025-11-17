// routes/commentRoutes.js
const express = require("express");
const router = express.Router();
const { createComment, replyToComment, deleteComment, voteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:threadId", protect, createComment);
router.post("/reply/:commentId", protect, replyToComment);
router.post("/vote/:commentId", protect, voteComment);
router.post("/delete/:commentId", protect, deleteComment);

module.exports = router;
