const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  viewCategoryThreads,
  deleteCategory,
} = require("../controllers/categoryController");

const { createThread } = require("../controllers/threadController");
const { restrictTo } = require("../middleware/authMiddleware");

// 🧭 Category routes
router.get("/", getAllCategories);                 // Show all categories
router.post("/", createCategory);                 // Create category
router.get("/:id", viewCategoryThreads);           // View threads in a category

// ➕ Create new thread inside category
router.post("/:categoryId/threads", createThread);

// 🗑️ Delete a category (only for moderator/admin)
router.get("/:id/delete", restrictTo("moderator", "admin"), deleteCategory);

module.exports = router;
