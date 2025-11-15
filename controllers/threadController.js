// controllers/threadController.js
const Thread = require("../models/Thread");
const Comment = require("../models/Comment");

exports.getAllThreads = async (req, res) => {
  try {
    const threads = await Thread.find()
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .lean();

    // Add comment counts (top-level comments only)
    const threadsWithCounts = await Promise.all(threads.map(async t => {
      const count = await Comment.countDocuments({ thread: t._id });
      return { ...t, commentsCount: count };
    }));

    res.render("threads", { title: "All Threads", threads: threadsWithCounts });
  } catch (err) {
    console.error("Get Threads Error:", err);
    res.status(500).render("error", { status: 500, error: "Failed to load threads" });
  }
};

exports.viewThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate("author", "username")
      .lean();

    if (!thread) return res.status(404).render("404", { url: req.originalUrl });

    // Fetch comments for this thread, including replies (Twitter-style: parent points to top comment)
    // We'll fetch all comments for thread, and display replies under their parent comment in the view.
    const comments = await Comment.find({ thread: thread._id })
      .populate("author", "username")
      .sort({ createdAt: 1 })
      .lean();

    // Build a map: parentId -> [comments]
    const repliesMap = {};
    const topLevel = [];
    comments.forEach(c => {
      if (c.parent) {
        const pid = c.parent.toString();
        if (!repliesMap[pid]) repliesMap[pid] = [];
        repliesMap[pid].push(c);
      } else {
        topLevel.push(c);
      }
    });

    res.render("thread_view", {
      title: thread.title,
      thread,
      comments: topLevel,
      repliesMap
    });
  } catch (err) {
    console.error("View Thread Error:", err);
    res.status(500).render("error", { status: 500, error: "Failed to load thread" });
  }
};

exports.createThread = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).render("threads", { error_msg: "Title and content required." });
    }

    const newThread = await Thread.create({
      title: title.trim(),
      content: content.trim(),
      category: category || null,
      author: req.user._id
    });

    res.redirect(`/threads/${newThread._id}`);
  } catch (err) {
    console.error("Create Thread Error:", err);
    res.status(500).render("error", { status: 500, error: "Failed to create thread" });
  }
};

exports.voteThread = async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    const inc = type === "up" ? 1 : -1;
    await Thread.findByIdAndUpdate(req.params.id, { $inc: { votes: inc }});
    // prefer redirect back to referer if available
    return res.redirect(req.get("referer") || `/threads/${req.params.id}`);
  } catch (err) {
    console.error("Vote thread error:", err);
    res.status(500).render("error", { status: 500, error: "Failed to vote" });
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.redirect("back");

    // Only author or moderator/admin
    if (thread.author.toString() !== req.user._id.toString() && !["admin", "moderator"].includes(req.user.role)) {
      return res.status(403).render("error", { status: 403, error: "Forbidden" });
    }

    // Delete comments in thread
    await Comment.deleteMany({ thread: thread._id });
    await Thread.findByIdAndDelete(thread._id);

    res.redirect("/threads");
  } catch (err) {
    console.error("Delete thread error:", err);
    res.status(500).render("error", { status: 500, error: "Failed to delete thread" });
  }
};
