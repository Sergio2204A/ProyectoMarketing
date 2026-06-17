const { generateHashtagsAI } = require("../services/aiService");

const generateHashtags = async (req, res) => {
  const { product } = req.body;

  try {
    const hashtagsText = await generateHashtagsAI(product);
    // Extraer los hashtags individuales limpiando espacios
    const hashtagsArray = hashtagsText
      .split(/\s+/)
      .map(tag => tag.trim())
      .filter(tag => tag.startsWith("#"));

    res.json({
      success: true,
      hashtags: hashtagsArray.length > 0 ? hashtagsArray : [hashtagsText]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar los hashtags con IA",
      error: error.message
    });
  }
};

module.exports = {
  generateHashtags
};