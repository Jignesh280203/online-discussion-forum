const Category = require("../models/Category");
const Thread = require("../models/Thread");

// 📂 Show all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    // optional flash messages already passed through res.locals
    res.render("category", { categories, title: "Categories" });
  } catch (err) {
    console.error("Error loading categories:", err.message);
    req.flash?.("error_msg", "❌ Failed to load categories. Please try again.");
    res.redirect("/");
  }
};

// ➕ Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Basic validation
    if (!name || !description) {
      req.flash?.("error_msg", "⚠️ Please provide both name and description.");
      return res.redirect("/categories");
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      req.flash?.("error_msg", "⚠️ A category with this name already exists.");
      return res.redirect("/categories");
    }

    // Create category
    await Category.create({ name: name.trim(), description: description.trim() });

    req.flash?.("success_msg", "✅ Category created successfully!");
    res.redirect("/categories");
  } catch (err) {
    console.error("Error creating category:", err.message);
    req.flash?.("error_msg", "❌ Could not create category.");
    res.redirect("/categories");
  }
};

// 📄 Show threads inside a category
exports.viewCategoryThreads = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      req.flash?.("error_msg", "⚠️ Category not found.");
      return res.redirect("/categories");
    }

    const threads = await Thread.find({ category: category._id }).populate("author");

    res.render("thread", { category, threads, title: category.name });
  } catch (err) {
    console.error("Error loading threads for category:", err.message);
    req.flash?.("error_msg", "❌ Could not load threads for this category.");
    res.redirect("/categories");
  }
};

// 🗑️ Delete a category (moderator/admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      req.flash?.("error_msg", "⚠️ Category not found.");
      return res.redirect("/categories");
    }

    // Delete all threads inside this category first
    await Thread.deleteMany({ category: categoryId });

    // Then delete the category itself
    await Category.findByIdAndDelete(categoryId);

    req.flash?.("success_msg", "🗑️ Category and its threads deleted successfully!");
    res.redirect("/categories");
  } catch (err) {
    console.error("Error deleting category:", err.message);
    req.flash?.("error_msg", "❌ Failed to delete category.");
    res.redirect("/categories");
  }
};
