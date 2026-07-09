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

const getUpcoming = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(todayStart);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const calendars = await Generation.find({
      type: "calendar",
      "output.scheduledDate": { $gte: todayStart, $lt: sevenDaysLater },
    }).populate("userId", "name");

    const upcoming = [];
    for (const generation of calendars) {
      for (const item of generation.output) {
        const scheduledDate = new Date(item.scheduledDate);
        if (scheduledDate >= todayStart && scheduledDate < sevenDaysLater) {
          upcoming.push({
            generationId: generation._id,
            product: generation.input?.product || "Sin nombre",
            day: item.day,
            topic: item.topic,
            scheduledDate: item.scheduledDate,
            creatorName: generation.userId?.name || "Alguien del equipo",
          });
        }
      }
    }

    upcoming.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    res.json({ success: true, upcoming });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las próximas publicaciones",
      error: error.message,
    });
  }
};

module.exports = { generateCalendar, getUpcoming };
