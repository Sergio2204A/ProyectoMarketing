const { generateVideoScriptAI, generateVideoScriptChatAI } = require("../services/aiService");
const Generation = require("../models/Generation");

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
const RUNWAY_API_URL = "https://api.dev.runwayml.com/v1";
const RUNWAY_VERSION = "2024-11-06";

const generateVideoScript = async (req, res) => {
  const { product, format, duration, goal, audience, country, region } = req.body;

  try {
    const script = await generateVideoScriptAI(product, format, duration, goal, audience, country, region);

    const saved = await Generation.create({
      userId: req.user._id,
      type: "video",
      input: { product, format, duration, goal, audience, country, region },
      output: script,
    });

    res.json({ success: true, script, generationId: saved._id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar el script de video con IA",
      error: error.message,
    });
  }
};

/* ── Video real con Runway ── */
const generateRealVideo = async (req, res) => {
  const { product, prompt, imageUrl, duration } = req.body;

  if (!RUNWAY_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Falta configurar RUNWAY_API_KEY en el archivo .env del backend.",
    });
  }

  try {
    const startImage =
      imageUrl ||
      `https://image.pollinations.ai/prompt/${encodeURIComponent(
        `${prompt || product}, professional marketing photo, cinematic, no text, no watermark, high quality, 4k`
      )}?width=1280&height=768&nologo=true&model=flux&seed=${Date.now()}`;

    const runwayRes = await fetch(`${RUNWAY_API_URL}/image_to_video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        "X-Runway-Version": RUNWAY_VERSION,
      },
      body: JSON.stringify({
        promptImage: startImage,
        promptText: prompt || `${product}, cinematic camera movement, professional marketing video`,
        model: "gen4_turbo",
        ratio: "1280:720",
        duration: Number(duration) === 10 ? 10 : 5,
      }),
    });

    const data = await runwayRes.json();
    if (!runwayRes.ok) {
      console.error("Runway error completo:", JSON.stringify(data));
      throw new Error(JSON.stringify(data.errors || data.error || data.message || data));
    }

    res.json({ success: true, taskId: data.id, startImage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRealVideoStatus = async (req, res) => {
  if (!RUNWAY_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Falta configurar RUNWAY_API_KEY en el archivo .env del backend.",
    });
  }

  try {
    const runwayRes = await fetch(`${RUNWAY_API_URL}/tasks/${req.params.taskId}`, {
      headers: {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        "X-Runway-Version": RUNWAY_VERSION,
      },
    });

    const data = await runwayRes.json();
    if (!runwayRes.ok) {
      throw new Error(data.error || data.message || "Error al consultar el estado del video");
    }

    res.json({
      success: true,
      status: data.status,
      videoUrl: data.output?.[0] || null,
      progress: data.progress ?? null,
      failure: data.failure || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const videoScriptChat = async (req, res) => {
  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: "Faltan los mensajes del chat." });
  }
  try {
    const result = await generateVideoScriptChatAI(messages, context || {});
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateVideoScript, generateRealVideo, getRealVideoStatus, videoScriptChat };
