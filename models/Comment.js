const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: "Thread" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  replies: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);
