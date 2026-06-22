const { generateTrendsAI } = require("../services/aiService");

const generateTrends = async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ success: false, message: "El campo 'topic' es requerido" });
  }
  try {
    const trends = await generateTrendsAI(topic);
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar tendencias con IA",
      error: error.message,
    });
  }
};

module.exports = { generateTrends };
