const { generateCopyAI } = require("../services/aiService");

const generateCopy = async (req, res) => {
  const { product, audience } = req.body;

  try {
    const copyText = await generateCopyAI(product, audience);
    res.json({
      success: true,
      copy: copyText
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar el copy con IA",
      error: error.message
    });
  }
};

module.exports = {
  generateCopy
};