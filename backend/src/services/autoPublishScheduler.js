const cron = require("node-cron");
const Generation = require("../models/Generation");
const { decrypt } = require("../utils/tokenCrypto");
const { postToPlatform } = require("../controllers/publishController");
const { sendAutoPublishFailedEmail } = require("./emailService");

/* "Instagram" -> "instagram", etc. Instagram/TikTok se excluyen a propósito: requieren
   imagen/video por día, que todavía no existe en el calendario (queda para una fase futura). */
const PLATFORM_KEY = { Facebook: "facebook", Twitter: "twitter", LinkedIn: "linkedin" };

async function notifyOnce(user, item, reason) {
  if (item.autoPublishFailedNotified || !user?.email) return;
  try {
    await sendAutoPublishFailedEmail(user.email, { topic: item.topic, platform: item.day, reason });
  } catch (error) {
    console.error("Error enviando aviso de auto-publish fallido:", error.message);
  }
  item.autoPublishFailedNotified = true;
}

async function runAutoPublish() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const calendars = await Generation.find({
    type: "calendar",
    status: "approved",
    "output.scheduledDate": { $gte: yesterday, $lte: now },
  }).populate({ path: "userId", select: "name email +socialTokens" });

  for (const generation of calendars) {
    const user = generation.userId;
    let changed = false;

    for (const item of generation.output) {
      const scheduledDate = new Date(item.scheduledDate);
      const isDue = scheduledDate >= yesterday && scheduledDate <= now;
      if (!isDue || item.autoPublished) continue;

      const platformKey = PLATFORM_KEY[generation.input?.platform];
      if (!platformKey) {
        await notifyOnce(user, item, `Auto-publicación en ${generation.input?.platform} todavía no está soportada (requiere imagen/video por día).`);
        changed = true;
        continue;
      }

      const credentials = decrypt(user?.socialTokens?.[platformKey]);
      if (!credentials?.accessToken) {
        await notifyOnce(user, item, `No tienes conectada tu cuenta de ${generation.input.platform}. Conéctala desde Redes Sociales.`);
        changed = true;
        continue;
      }

      try {
        await postToPlatform(platformKey, credentials, { content: item.caption });
        item.autoPublished = true;
        changed = true;
      } catch (error) {
        console.error("Error en auto-publish:", error.message);
        await notifyOnce(user, item, error.message);
        changed = true;
      }
    }

    if (changed) {
      if (generation.output.every((item) => item.autoPublished)) {
        generation.status = "published";
      }
      generation.markModified("output");
      await generation.save();
    }
  }
}

function startAutoPublishScheduler() {
  cron.schedule("*/15 * * * *", runAutoPublish, { timezone: "America/Bogota" });
}

module.exports = { startAutoPublishScheduler, runAutoPublish };
