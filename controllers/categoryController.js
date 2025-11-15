const Category = require("../models/Category");
const Thread = require("../models/Thread");

exports.getAllCategories = async (req, res) => {
  try {
    // also compute thread count for each category
    const categories = await Category.find().lean();

    // for each category compute count (simple approach)
    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => {
        const count = await Thread.countDocuments({ category: c._id });
        return { ...c, count };
      })
    );

    res.render("category", { categories: categoriesWithCount, title: "Categories" });
  } catch (err) {
    console.error("Load categories:", err);
    res.status(500).render("error", { status: 500, error: "Failed to load categories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    // only moderator/admin allowed — route should protect this earlier; double-check
    const { name, description } = req.body;
    if (!name) return res.status(400).render("category", { title: "Categories", error_msg: "Name required." });

    await Category.create({ name, description });
    res.redirect("/categories");
  } catch (err) {
    console.error("Create category:", err);
    res.status(500).render("error", { status: 500, error: "Failed to create category" });
  }
};

exports.viewCategoryThreads = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).render("404", { url: req.originalUrl });

    const threads = await Thread.find({ category: category._id })
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .lean();

    res.render("thread", { category, threads, title: category.name });
  } catch (err) {
    console.error("View category threads:", err);
    res.status(500).render("error", { status: 500, error: "Failed to load threads" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const catId = req.params.id;
    // delete threads in category
    await Thread.deleteMany({ category: catId });
    await Category.findByIdAndDelete(catId);
    res.redirect("/categories");
  } catch (err) {
    console.error("Delete category:", err);
    res.status(500).render("error", { status: 500, error: "Failed to delete category" });
  }
};
