const express = require("express");
const router = express.Router();
const { generateVideoScript, generateRealVideo, getRealVideoStatus } = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, generateVideoScript);
router.post("/real", protect, generateRealVideo);
router.get("/real/:taskId", protect, getRealVideoStatus);

module.exports = router;
