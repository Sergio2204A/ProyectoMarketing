const { refineContentAI } = require("../services/aiService");
const Generation = require("../models/Generation");

const refineContent = async (req, res) => {
  const { type, input, output } = req.body;

  if (!type || !output) {
    return res.status(400).json({ success: false, message: "Se requiere type y output" });
  }

  try {
    const refined = await refineContentAI(type, input, output);

    await Generation.create({
      userId: req.user._id,
      type,
      input: { ...input, refined: true },
      output: refined,
    });

    res.json({ success: true, refined });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { refineContent };
