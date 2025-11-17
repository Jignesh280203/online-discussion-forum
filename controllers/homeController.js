// controllers/homeController.js
const Category = require("../models/Category");
const Thread = require("../models/Thread");
const Comment = require("../models/Comment");

exports.dashboard = async (req, res) => {
  try {
    const stats = {
      categories: await Category.countDocuments(),
      threads: await Thread.countDocuments(),
      yourThreads: req.user ? await Thread.countDocuments({ author: req.user._id }) : 0,
      yourComments: req.user ? await Comment.countDocuments({ author: req.user._id }) : 0
    };

    const trending = await Thread.find().sort({ votes: -1 }).limit(6).lean();
    const recent = await Thread.find().sort({ createdAt: -1 }).limit(6).populate("author", "username").lean();

    res.render("index", { stats, trending, recent, title: "Home" });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).render("error", { error: err.message, status: 500 });
  }
};
