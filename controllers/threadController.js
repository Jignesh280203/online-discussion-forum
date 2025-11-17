// controllers/threadController.js
const Thread = require("../models/Thread");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");

exports.getAllThreads = async (req, res) => {
  try {
    const threads = await Thread.find().populate("author", "username").sort({ createdAt: -1 }).lean();

    // compute commentsCount for each thread (parallel)
    const threadsWithCounts = await Promise.all(threads.map(async t => {
      const count = await Comment.countDocuments({ thread: t._id });
      return { ...t, commentsCount: count };
    }));

    res.render("threads", { threads: threadsWithCounts, title: "All Threads" });
  } catch (err) {
    console.error("Get all threads:", err);
    res.status(500).render("error", { error: err.message, status: 500 });
  }
};

exports.viewThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id).populate("author", "username").lean();
    if (!thread) return res.status(404).render("404", { url: req.originalUrl });

    // get comments for the thread (populate author)
    const comments = await Comment.find({ thread: thread._id }).populate("author", "username").sort({ createdAt: -1 }).lean();

    // build repliesMap: replies are embedded inside comment.replies
    const repliesMap = {};
    comments.forEach(c => {
      repliesMap[c._id] = c.replies || [];
    });

    res.render("thread_view", { thread, comments, repliesMap, title: thread.title });
  } catch (err) {
    console.error("View thread:", err);
    res.status(500).render("error", { error: err.message, status: 500 });
  }
};

exports.createThread = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) return res.status(400).send("Title and content required");

    const newThread = await Thread.create({
      title,
      content,
      category: category || null,
      author: req.user._id,
      votes: 0
    });

    res.redirect(`/threads/${newThread._id}`);
  } catch (err) {
    console.error("Create thread:", err);
    res.status(500).send("Error creating thread");
  }
};

exports.voteThread = async (req, res) => {
  try {
    const threadId = req.params.id;
    const { type } = req.body;
    if (!["up", "down"].includes(type)) return res.redirect("back");

    const delta = type === "up" ? 1 : -1;
    await Thread.findByIdAndUpdate(threadId, { $inc: { votes: delta } });
    res.redirect("back");
  } catch (err) {
    console.error("Vote thread:", err);
    res.status(500).send("Error voting");
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).send("Thread not found");

    // allow only author or moderator/admin
    if (thread.author.toString() !== req.user._id.toString() && !["moderator","admin"].includes(req.user.role)) {
      return res.status(403).send("Not authorized");
    }

    // delete comments tied to thread
    await Comment.deleteMany({ thread: thread._id });
    await thread.deleteOne();
    res.redirect("/threads");
  } catch (err) {
    console.error("Delete thread:", err);
    res.status(500).send("Error deleting thread");
  }
};
