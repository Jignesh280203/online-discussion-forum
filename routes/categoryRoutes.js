const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  createCategory,
  viewCategoryThreads,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

// Show categories
router.get("/", getAllCategories);

// Create category (only moderator/admin)
router.post("/", protect, restrictTo("moderator", "admin"), createCategory);

// View threads inside a category
router.get("/:id", viewCategoryThreads);

// Delete category (only moderator/admin)
router.get("/:id/delete", protect, restrictTo("moderator", "admin"), deleteCategory);

module.exports = router;
