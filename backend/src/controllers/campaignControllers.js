const { generateCampaignAI } = require("../services/aiService");

const generateCampaign = async (req, res) => {
  const {
    product,
    goal,
    audience,
    channel
  } = req.body;

  try {
    const campaignText = await generateCampaignAI(product, goal, audience, channel);
    res.json({
      success: true,
      campaign: campaignText
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar la campaña con IA",
      error: error.message
    });
  }
};

module.exports = {
  generateCampaign
};