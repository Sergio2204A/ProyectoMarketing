const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  saveSocialCredentials,
  getSocialCredentials,
  disconnectSocialCredentials,
  publishContent,
} = require("../controllers/publishController");

router.post("/", protect, publishContent);
router.get("/credentials", protect, getSocialCredentials);
router.post("/credentials", protect, saveSocialCredentials);
router.delete("/credentials/:platform", protect, disconnectSocialCredentials);

module.exports = router;
