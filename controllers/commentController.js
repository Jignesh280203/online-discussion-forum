// controllers/commentController.js
const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const threadId = req.params.threadId;
    if (!content) return res.status(400).send("Empty comment");

    await Comment.create({
      thread: threadId,
      author: req.user._id,
      content,
      votes: 0,
      replies: []
    });

    res.redirect(`/threads/${threadId}`);
  } catch (err) {
    console.error("Create comment:", err);
    res.status(500).send("Error adding comment");
  }
};

exports.replyToComment = async (req, res) => {
  try {
    const cid = req.params.commentId;
    const { content } = req.body;
    if (!content) return res.status(400).send("Empty reply");

    const reply = {
      author: req.user._id,
      content,
      createdAt: new Date()
    };

    await Comment.findByIdAndUpdate(cid, { $push: { replies: reply } });
    // find the parent comment to get thread id to redirect
    const parent = await Comment.findById(cid).lean();
    res.redirect(parent ? `/threads/${parent.thread}` : "/threads");
  } catch (err) {
    console.error("Reply comment:", err);
    res.status(500).send("Error replying");
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const cid = req.params.commentId;
    const comment = await Comment.findById(cid);
    if (!comment) return res.status(404).send("Not found");

    // only author or admin/mod
    if (comment.author.toString() !== req.user._id.toString() && !["admin","moderator"].includes(req.user.role)) {
      return res.status(403).send("Not authorized");
    }

    await comment.deleteOne();
    res.redirect("back");
  } catch (err) {
    console.error("Delete comment:", err);
    res.status(500).send("Error deleting comment");
  }
};

exports.voteComment = async (req, res) => {
  try {
    const cid = req.params.commentId;
    const { type } = req.body;
    const delta = type === "up" ? 1 : (type === "down" ? -1 : 0);
    if (!delta) return res.redirect("back");
    await Comment.findByIdAndUpdate(cid, { $inc: { votes: delta } });
    res.redirect("back");
  } catch (err) {
    console.error("Vote comment:", err);
    res.status(500).send("Error voting");
  }
};
