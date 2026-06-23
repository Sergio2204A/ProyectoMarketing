const express = require("express");
const router = express.Router();
const { refineContent } = require("../controllers/refineController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, refineContent);

module.exports = router;
