const Thread = require("../models/Thread");
const Category = require("../models/Category");
const Comment = require("../models/Comment");

// ➕ Create new thread
exports.createThread = async (req, res) => {
  try {
    const { title, content } = req.body;
    const categoryId = req.params.categoryId;

    await Thread.create({
      title,
      content,
      category: categoryId,
      author: null // Will connect with user later
    });

    res.redirect(`/categories/${categoryId}`);
  } catch (err) {
    console.error(err);
    res.send("❌ Error creating thread");
  }
};

// 🗨️ Add comment to a thread
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const threadId = req.params.threadId;

    await Comment.create({
      content,
      thread: threadId,
      author: null // attach logged user later
    });

    res.redirect(`/threads/${threadId}`);
  } catch (err) {
    console.error(err);
    res.send("❌ Error adding comment");
  }
};

// 📄 View a single thread and its comments
exports.viewThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id).populate("author category");
    const comments = await Comment.find({ thread: thread._id }).populate("author");
    res.render("thread_view", { thread, comments, title: thread.title });
  } catch (err) {
    console.error(err);
    res.send("❌ Error loading thread view");
  }
};

// ⬆️⬇️ Vote on a thread
exports.voteThread = async (req, res) => {
  try {
    const { type } = req.params; // 'up' or 'down'
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.send("Thread not found");

    if (type === "up") thread.votes += 1;
    if (type === "down") thread.votes -= 1;
    await thread.save();

    res.redirect(`/threads/${thread._id}`);
  } catch (err) {
    console.error(err);
    res.send("❌ Error voting on thread");
  }
};

// 🧰 Delete thread (moderator/admin)
exports.deleteThread = async (req, res) => {
  try {
    await Thread.findByIdAndDelete(req.params.id);
    res.redirect("/categories");
  } catch (err) {
    console.error(err);
    res.send("❌ Error deleting thread");
  }
};
