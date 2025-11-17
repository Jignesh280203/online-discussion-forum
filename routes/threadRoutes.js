// routes/threadRoutes.js
const express = require("express");
const router = express.Router();
const { getAllThreads, viewThread, createThread, voteThread, deleteThread } = require("../controllers/threadController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllThreads);
router.get("/:id", viewThread);
router.post("/", protect, createThread);
router.post("/:id/vote", protect, voteThread);
router.post("/:id/delete", protect, deleteThread);

module.exports = router;
