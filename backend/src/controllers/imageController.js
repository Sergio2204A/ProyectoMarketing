const User = require("../models/User");
const { decrypt } = require("../utils/tokenCrypto");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/images";

const generateImage = async (req, res) => {
  const { prompt, size, quality } = req.body;

  if (!prompt?.trim()) {
    return res.status(400).json({ success: false, message: "El prompt es requerido." });
  }

  try {
    let apiKeyToUse = OPENAI_API_KEY;

    if (quality && quality !== "low") {
      const user = await User.findById(req.user._id).select("+personalApiKeys");
      const personalKey = decrypt(user?.personalApiKeys?.openai);
      if (!personalKey) {
        return res.status(402).json({
          success: false,
          code: "PERSONAL_KEY_REQUIRED",
          message: "Para generar en esta calidad necesitas configurar tu propia API key de OpenAI.",
        });
      }
      apiKeyToUse = personalKey;
    }

    if (!apiKeyToUse) {
      return res.status(500).json({ success: false, message: "Falta configurar OPENAI_API_KEY en el archivo .env del backend." });
    }

    const hasReferenceImage = !!req.file;
    let b64;

    if (hasReferenceImage) {
      /* ── Edición / referencia de imagen con gpt-image-1 ── */
      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", prompt.trim());
      form.append("image", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
      form.append("size", size || "1024x1024");
      form.append("quality", quality || "auto");
      form.append("n", "1");

      const response = await fetch(`${OPENAI_URL}/edits`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKeyToUse}` },
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Error en OpenAI Images edits API");
      b64 = data.data[0].b64_json;
    } else {
      /* ── Generación desde texto con gpt-image-1 ── */
      const response = await fetch(`${OPENAI_URL}/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKeyToUse}` },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: prompt.trim(),
          n: 1,
          size: size || "1024x1024",
          quality: quality || "auto",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Error en OpenAI Images generations API");
      b64 = data.data[0].b64_json;
    }

    res.json({ success: true, b64, mimeType: "image/png" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateImage };
