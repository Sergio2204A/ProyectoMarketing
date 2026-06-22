const express = require("express");
const router = express.Router();
const { generateHashtags } = require("../controllers/hashtagController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, generateHashtags);

module.exports = router;
