const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getMetaConnectUrl,
  metaCallback,
  listMetaPendingPages,
  selectMetaPage,
  getTikTokConnectUrl,
  tiktokCallback,
  getLinkedInConnectUrl,
  linkedinCallback,
} = require("../controllers/socialAuthController");

router.get("/meta/connect", protect, getMetaConnectUrl);
router.get("/meta/callback", metaCallback); // llamado por Facebook, sin header de Authorization
router.get("/meta/pending-pages", protect, listMetaPendingPages);
router.post("/meta/select-page", protect, selectMetaPage);

router.get("/tiktok/connect", protect, getTikTokConnectUrl);
router.get("/tiktok/callback", tiktokCallback); // llamado por TikTok, sin header de Authorization

router.get("/linkedin/connect", protect, getLinkedInConnectUrl);
router.get("/linkedin/callback", linkedinCallback); // llamado por LinkedIn, sin header de Authorization

module.exports = router;
