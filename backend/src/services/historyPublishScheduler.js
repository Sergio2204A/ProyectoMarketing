const cron = require("node-cron");
const Generation = require("../models/Generation");
const { decrypt } = require("../utils/tokenCrypto");
const { postToPlatform } = require("../controllers/publishController");
const { ensureFreshTikTokToken } = require("../controllers/socialAuthController");
const { sendAutoPublishFailedEmail } = require("./emailService");

const PLATFORM_LABEL = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", twitter: "Twitter / X", linkedin: "LinkedIn" };

async function notifyOnce(user, product, platform, reason, result) {
  if (result.notifiedFailure || !user?.email) return;
  try {
    await sendAutoPublishFailedEmail(user.email, { topic: product, platform: PLATFORM_LABEL[platform] || platform, reason });
  } catch (error) {
    console.error("Error enviando aviso de publicación agendada fallida:", error.message);
  }
  result.notifiedFailure = true;
}

/* Revisa los items del historial con una publicación agendada pendiente cuya fecha ya llegó,
   y publica en cada red elegida usando la cuenta social conectada del creador. A diferencia
   del auto-publish del calendario, acá no se reintenta: si falla queda "failed" y se avisa por
   email una sola vez — el usuario puede volver a agendar manualmente. */
async function runHistoryScheduledPublish() {
  const now = new Date();

  const items = await Generation.find({
    "scheduledPublish.status": "pending",
    "scheduledPublish.date": { $lte: now },
  }).populate({ path: "userId", select: "name email +socialTokens" });

  for (const generation of items) {
    const user = generation.userId;
    const schedule = generation.scheduledPublish;
    if (!schedule) continue;

    const content = Array.isArray(generation.output) ? generation.output.join(" ") : generation.output;
    const product = generation.input?.product || "tu contenido";
    let changed = false;

    for (const result of schedule.results) {
      if (result.status !== "pending") continue;
      changed = true;

      try {
        const credentials =
          result.platform === "tiktok" ? await ensureFreshTikTokToken(user) : decrypt(user?.socialTokens?.[result.platform]);

        if (!credentials?.accessToken) {
          throw new Error(`No tienes conectada tu cuenta de ${PLATFORM_LABEL[result.platform] || result.platform}. Conéctala desde Redes Sociales.`);
        }

        await postToPlatform(result.platform, credentials, {
          content,
          imageUrl: generation.imageUrl,
          videoUrl: generation.videoUrl,
        });
        result.status = "success";
        result.publishedAt = new Date();
      } catch (error) {
        result.status = "failed";
        result.error = error.message;
        await notifyOnce(user, product, result.platform, error.message, result);
      }
    }

    if (changed) {
      const stillPending = schedule.results.some((r) => r.status === "pending");
      if (!stillPending) {
        schedule.status = "done";
        if (schedule.results.some((r) => r.status === "success")) {
          generation.status = "published";
        }
      }
      generation.markModified("scheduledPublish");
      await generation.save();
    }
  }
}

function startHistoryPublishScheduler() {
  cron.schedule("*/15 * * * *", runHistoryScheduledPublish, { timezone: "America/Bogota" });
}

module.exports = { startHistoryPublishScheduler, runHistoryScheduledPublish };
