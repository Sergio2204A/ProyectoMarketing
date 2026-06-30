const { generateCampaignAI } = require("../services/aiService");
const Generation = require("../models/Generation");

const generateCampaign = async (req, res) => {
  const { product, goal, audience, channel, country, region } = req.body;

  try {
    const campaignText = await generateCampaignAI(product, goal, audience, channel, country, region);

    const saved = await Generation.create({
      userId: req.user._id,
      type: "campaign",
      input: { product, goal, audience, channel, country, region },
      output: campaignText,
    });

    res.json({ success: true, campaign: campaignText, generationId: saved._id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar la campaña con IA",
      error: error.message,
    });
  }
};

module.exports = { generateCampaign };
