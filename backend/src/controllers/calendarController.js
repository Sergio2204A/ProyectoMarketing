const { generateCalendarAI } = require("../services/aiService");

const generateCalendar = async (req, res) => {
  const { product, platform, goal } = req.body;

  try {
    let rawJson = await generateCalendarAI(product, platform, goal);
    
    // Limpieza preventiva por si la IA devuelve bloques de código markdown
    rawJson = rawJson.trim();
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const calendarData = JSON.parse(rawJson);
    
    res.json({
      success: true,
      calendar: calendarData
    });
  } catch (error) {
    console.error("Error en generateCalendar controller:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el calendario de contenidos con IA",
      error: error.message
    });
  }
};

module.exports = {
  generateCalendar
};
