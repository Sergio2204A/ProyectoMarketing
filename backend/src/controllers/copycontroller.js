const { generateCopyAI } = require("../services/aiService");
const Generation = require("../models/Generation");

const generateCopy = async (req, res) => {
  const { product, audience, country, region } = req.body;

  try {
    const copyText = await generateCopyAI(product, audience, country, region);

    const saved = await Generation.create({
      userId: req.user._id,
      type: "copy",
      input: { product, audience, country, region },
      output: copyText,
    });

    res.json({ success: true, copy: copyText, generationId: saved._id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar el copy con IA",
      error: error.message,
    });
  }
};

module.exports = { generateCopy };
