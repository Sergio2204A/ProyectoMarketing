const { generateHashtagsAI } = require("../services/aiService");
const Generation = require("../models/Generation");

const generateHashtags = async (req, res) => {
  const { product, country, region } = req.body;

  try {
    const hashtagsText = await generateHashtagsAI(product, country, region);
    const hashtagsArray = hashtagsText
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.startsWith("#"));

    const output = hashtagsArray.length > 0 ? hashtagsArray : [hashtagsText];

    const saved = await Generation.create({
      userId: req.user._id,
      type: "hashtag",
      input: { product },
      output,
    });

    res.json({ success: true, hashtags: output, generationId: saved._id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar los hashtags con IA",
      error: error.message,
    });
  }
};

module.exports = { generateHashtags };
