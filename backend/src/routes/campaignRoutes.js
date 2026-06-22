const express = require("express");
const router = express.Router();
const campaignControllers = require("../controllers/campaignControllers");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, campaignControllers.generateCampaign);

module.exports = router;
