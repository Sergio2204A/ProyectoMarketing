const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, calendarController.generateCalendar);
router.get("/upcoming", protect, calendarController.getUpcoming);

module.exports = router;
