const express = require("express");
const router = express.Router();
const { getHistory, deleteHistoryItem, clearHistory, toggleFavorite, updateImageUrl } = require("../controllers/historyController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getHistory);
router.patch("/:id/favorite", protect, toggleFavorite);
router.patch("/:id/image", protect, updateImageUrl);
router.delete("/clear", protect, clearHistory);
router.delete("/:id", protect, deleteHistoryItem);

module.exports = router;
