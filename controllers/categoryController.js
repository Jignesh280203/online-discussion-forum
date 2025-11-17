// controllers/categoryController.js
const Category = require("../models/Category");
const Thread = require("../models/Thread");

exports.getAllCategories = async (req, res) => {
  try {
    // attach thread counts
    const cats = await Category.find().sort({ createdAt: -1 }).lean();
    // compute counts
    const categories = await Promise.all(cats.map(async c => {
      const count = await Thread.countDocuments({ category: c._id });
      return { ...c, count };
    }));

    res.render("category", { categories, title: "Categories" });
  } catch (err) {
    console.error("Get categories:", err);
    res.status(500).render("error", { error: err.message, status: 500 });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).send("Name required");
    await Category.create({ name, description });
    res.redirect("/categories");
  } catch (err) {
    console.error("Create category:", err);
    res.status(500).send("Error creating category");
  }
};

exports.viewCategoryThreads = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).render("404", { url: req.originalUrl });

    const threads = await Thread.find({ category: category._id }).populate("author", "username").sort({ createdAt: -1 }).lean();
    // commentsCount
    const threadsWithCounts = await Promise.all(threads.map(async t => {
      const count = await Thread.aggregate([{ $match: { _id: t._id } }]); // fallback if needed
      // simpler: count comments separately:
      const comCount = await require("../models/Comment").countDocuments({ thread: t._id });
      return { ...t, commentsCount: comCount };
    }));

    res.render("thread", { category, threads: threadsWithCounts, title: category.name });
  } catch (err) {
    console.error("View category threads:", err);
    res.status(500).render("error", { error: err.message, status: 500 });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    await Thread.deleteMany({ category: categoryId });
    await Category.findByIdAndDelete(categoryId);
    res.redirect("/categories");
  } catch (err) {
    console.error("Delete category:", err);
    res.status(500).send("Error deleting category");
  }
};
