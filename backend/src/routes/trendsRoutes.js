const express = require("express");
const router = express.Router();
const { generateTrends } = require("../controllers/trendsController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, generateTrends);

module.exports = router;
