const express = require("express");
const campaignControllers = require("../controllers/campaignControllers");

const router = express.Router();

router.post("/", campaignControllers.generateCampaign);

module.exports = router;