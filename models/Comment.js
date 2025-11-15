// models/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: "Thread", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // Twitter-style reply parent
  votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Index for performance: thread + parent + createdAt
commentSchema.index({ thread: 1, parent: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
