// controllers/commentController.js
const Comment = require("../models/Comment");
const Thread = require("../models/Thread");

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const threadId = req.params.threadId;

    if (!content || !content.trim()) {
      return res.redirect(`/threads/${threadId}`);
    }

    const comment = await Comment.create({
      thread: threadId,
      author: req.user._id,
      content: content.trim(),
      parent: null
    });

    // optional: update thread to include comment id in an array (if using), not required
    res.redirect(`/threads/${threadId}#comment-${comment._id}`);
  } catch (err) {
    console.error("Add comment:", err);
    res.status(500).render("error", { status: 500, error: "Failed to add comment" });
  }
};

exports.replyComment = async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.commentId;
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) return res.redirect("back");

    if (!content || !content.trim()) return res.redirect("back");

    const reply = await Comment.create({
      thread: parentComment.thread,
      author: req.user._id,
      content: content.trim(),
      parent: parentComment._id
    });

    res.redirect(`/threads/${parentComment.thread}#comment-${reply._id}`);
  } catch (err) {
    console.error("Reply comment:", err);
    res.status(500).render("error", { status: 500, error: "Failed to reply" });
  }
};

exports.voteComment = async (req, res) => {
  try {
    const { type } = req.body;
    const commentId = req.params.commentId;
    const inc = type === "up" ? 1 : -1;
    await Comment.findByIdAndUpdate(commentId, { $inc: { votes: inc }});
    return res.redirect(req.get("referer") || "back");
  } catch (err) {
    console.error("Vote comment:", err);
    res.status(500).render("error", { status: 500, error: "Failed to vote" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const c = await Comment.findById(commentId);
    if (!c) return res.redirect("back");

    // only author or admin/moderator
    if (c.author.toString() !== req.user._id.toString() && !["admin", "moderator"].includes(req.user.role)) {
      return res.status(403).render("error", { status: 403, error: "Forbidden" });
    }

    // Delete this comment and any replies (twitter-style replies are separate docs with parent = this id)
    await Comment.deleteMany({ $or: [{ _id: commentId }, { parent: commentId }] });
    res.redirect(req.get("referer") || "back");
  } catch (err) {
    console.error("Delete comment:", err);
    res.status(500).render("error", { status: 500, error: "Failed to delete comment" });
  }
};
