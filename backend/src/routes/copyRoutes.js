const express = require("express");
const router = express.Router();
const copyController = require("../controllers/copycontroller");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, copyController.generateCopy);

module.exports = router;
