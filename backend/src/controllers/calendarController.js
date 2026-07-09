const { generateCalendarAI } = require("../services/aiService");
const Generation = require("../models/Generation");

const WEEKDAY_INDEX = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miércoles: 3,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6,
  sabado: 6,
};

function getNextDateForWeekday(dayName, fromDate) {
  const targetIndex = WEEKDAY_INDEX[(dayName || "").trim().toLowerCase()];
  const date = new Date(fromDate);
  date.setHours(0, 0, 0, 0);
  if (targetIndex === undefined) return date;

  const offset = (targetIndex - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + offset);
  return date;
}

const generateCalendar = async (req, res) => {
  const { product, platform, goal } = req.body;

  try {
    let rawJson = await generateCalendarAI(product, platform, goal);

    rawJson = rawJson.trim();
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const calendarData = JSON.parse(rawJson);
    const today = new Date();
    calendarData.forEach((item) => {
      item.scheduledDate = getNextDateForWeekday(item.day, today);
      item.reminderSent = false;
    });

    await Generation.create({
      userId: req.user._id,
      type: "calendar",
      input: { product, platform, goal },
      output: calendarData,
    });

    res.json({ success: true, calendar: calendarData });
  } catch (error) {
    console.error("Error en generateCalendar controller:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el calendario de contenidos con IA",
      error: error.message,
    });
  }
};

module.exports = { generateCalendar };
