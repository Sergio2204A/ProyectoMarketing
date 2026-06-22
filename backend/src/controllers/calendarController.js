const { generateCalendarAI } = require("../services/aiService");
const Generation = require("../models/Generation");

const generateCalendar = async (req, res) => {
  const { product, platform, goal } = req.body;

  try {
    let rawJson = await generateCalendarAI(product, platform, goal);

    rawJson = rawJson.trim();
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const calendarData = JSON.parse(rawJson);

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
