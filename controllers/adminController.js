const User = require("../models/User");
const Thread = require("../models/Thread");
const Category = require("../models/Category");

exports.list = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).send("Not authorized");
    const users = await User.find().lean();
    const threads = await Thread.find().populate("author", "username").lean();
    const categories = await Category.find().lean();
    res.render("admin", { users, threads, categories, title: "Admin" });
  } catch (err) {
    console.error("Admin list:", err);
    res.status(500).render("error", { status: 500, error: "Admin load failed" });
  }
};

exports.promoteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).send("Not authorized");
    const userId = req.params.userId;
    await User.findByIdAndUpdate(userId, { role: "moderator" });
    res.redirect("/admin");
  } catch (err) {
    console.error("Promote user:", err);
    res.status(500).render("error", { status: 500, error: "Failed to promote user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).send("Not authorized");
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    res.redirect("/admin");
  } catch (err) {
    console.error("Delete user:", err);
    res.status(500).render("error", { status: 500, error: "Failed to delete user" });
  }
};

exports.deleteThread = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).send("Not authorized");
    const threadId = req.params.threadId;
    await Thread.findByIdAndDelete(threadId);
    res.redirect("/admin");
  } catch (err) {
    console.error("Admin delete thread:", err);
    res.status(500).render("error", { status: 500, error: "Failed to delete thread" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).send("Not authorized");
    const categoryId = req.params.categoryId;
    await Thread.deleteMany({ category: categoryId });
    await Category.findByIdAndDelete(categoryId);
    res.redirect("/admin");
  } catch (err) {
    console.error("Admin delete category:", err);
    res.status(500).render("error", { status: 500, error: "Failed to delete category" });
  }
};
