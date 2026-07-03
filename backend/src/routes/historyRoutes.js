const express = require("express");
const router = express.Router();
const { getHistory, deleteHistoryItem, clearHistory, toggleFavorite, updateImageUrl, updateVideoUrl, updateOutput, saveGeneration } = require("../controllers/historyController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getHistory);
router.post("/save", protect, saveGeneration);
router.patch("/:id/favorite", protect, toggleFavorite);
router.patch("/:id/image", protect, updateImageUrl);
router.patch("/:id/video", protect, updateVideoUrl);
router.patch("/:id/output", protect, updateOutput);
router.delete("/clear", protect, clearHistory);
router.delete("/:id", protect, deleteHistoryItem);

module.exports = router;
