const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/tokenCrypto");

const getOpenAiKeyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+personalApiKeys");
    const apiKey = decrypt(user?.personalApiKeys?.openai);
    res.json({
      success: true,
      hasKey: !!apiKey,
      preview: apiKey ? `sk-...${apiKey.slice(-4)}` : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al consultar la API key" });
  }
};

const saveOpenAiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return res.status(400).json({ success: false, message: "La API key es requerida" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { "personalApiKeys.openai": encrypt(apiKey.trim()) },
    });

    res.json({ success: true, message: "API key guardada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al guardar la API key" });
  }
};

const deleteOpenAiKey = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { "personalApiKeys.openai": "" },
    });
    res.json({ success: true, message: "API key eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar la API key" });
  }
};

module.exports = { getOpenAiKeyStatus, saveOpenAiKey, deleteOpenAiKey };
