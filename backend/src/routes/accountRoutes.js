const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { protect } = require("../middleware/authMiddleware");

router.get("/openai-key", protect, accountController.getOpenAiKeyStatus);
router.post("/openai-key", protect, accountController.saveOpenAiKey);
router.delete("/openai-key", protect, accountController.deleteOpenAiKey);

module.exports = router;
