const crypto = require("crypto");
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/tokenCrypto");
const { ensureFreshTikTokToken } = require("./socialAuthController");

const GRAPH_API = "https://graph.facebook.com/v21.0";
const TIKTOK_API = "https://open.tiktokapis.com/v2";
const VALID_PLATFORMS = ["facebook", "instagram", "tiktok", "twitter", "linkedin"];
const OAUTH_MANAGED_PLATFORMS = ["facebook", "instagram", "tiktok", "linkedin"];

/* ── OAuth 1.0a para Twitter ── */
function buildTwitterOAuthHeader(method, url, apiKey, apiSecret, accessToken, accessTokenSecret) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString),
  ].join("&");

  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessTokenSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
  oauthParams.oauth_signature = signature;

  return (
    "OAuth " +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
      .join(", ")
  );
}

const saveSocialCredentials = async (req, res) => {
  try {
    const { platform, credentials } = req.body;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ success: false, message: "Plataforma no válida" });
    }
    if (OAUTH_MANAGED_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `${platform} se conecta con el botón "Conectar con Meta/TikTok", no con tokens manuales.`,
      });
    }
    if (!credentials || typeof credentials !== "object") {
      return res.status(400).json({ success: false, message: "Credenciales inválidas" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { [`socialTokens.${platform}`]: encrypt(credentials) },
    });

    res.json({ success: true, message: "Cuenta conectada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al guardar credenciales" });
  }
};

const getSocialCredentials = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+socialTokens");
    const tokens = user.socialTokens || {};
    const result = {};

    for (const platform of VALID_PLATFORMS) {
      const creds = decrypt(tokens[platform]);
      let isConnected = false;
      let displayId = "";

      if (platform === "twitter") {
        isConnected = !!(creds?.accessToken && creds?.apiKey);
        displayId = creds?.apiKey ? creds.apiKey.slice(0, 8) + "..." : "";
      } else if (platform === "tiktok") {
        isConnected = !!creds?.accessToken;
        displayId = creds?.openId ? creds.openId.slice(0, 8) + "..." : "";
      } else {
        isConnected = !!creds?.accessToken;
        displayId = platform === "instagram" ? creds?.username ? `@${creds.username}` : creds?.pageId : creds?.pageName || creds?.pageId;
      }

      if (isConnected) {
        result[platform] = {
          connected: true,
          pageId: displayId,
          tokenPreview: creds.accessToken.slice(0, 10) + "...",
        };
      } else {
        result[platform] = { connected: false };
      }
    }

    res.json({ success: true, credentials: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener credenciales" });
  }
};

const disconnectSocialCredentials = async (req, res) => {
  try {
    const { platform } = req.params;
    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ success: false, message: "Plataforma no válida" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $unset: { [`socialTokens.${platform}`]: "" },
    });

    res.json({ success: true, message: "Cuenta desconectada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al desconectar" });
  }
};

const publishContent = async (req, res) => {
  try {
    const { platform, content, imageUrl, videoUrl } = req.body;

    if (!platform || !content) {
      return res.status(400).json({ success: false, message: "Faltan datos requeridos" });
    }
    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ success: false, message: "Plataforma no soportada" });
    }

    const user = await User.findById(req.user._id).select("+socialTokens");
    const credentials =
      platform === "tiktok" ? await ensureFreshTikTokToken(user) : decrypt(user.socialTokens?.[platform]);

    if (!credentials?.accessToken) {
      return res.status(400).json({
        success: false,
        message: `No hay cuenta de ${platform} conectada. Conéctala primero desde Redes Sociales.`,
      });
    }

    /* ── Facebook ── */
    if (platform === "facebook") {
      const { pageId, accessToken } = credentials;
      const fbRes = await fetch(`${GRAPH_API}/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, access_token: accessToken }),
      });
      const fbData = await fbRes.json();
      if (!fbRes.ok) throw new Error(fbData.error?.message || "Error de Meta API");
      return res.json({ success: true, postId: fbData.id, message: "¡Publicado en Facebook exitosamente!" });
    }

    /* ── Instagram ── */
    if (platform === "instagram") {
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Instagram requiere una imagen. Genera una imagen para esta campaña primero.",
        });
      }
      const { pageId, accessToken } = credentials;
      const mediaRes = await fetch(`${GRAPH_API}/${pageId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, caption: content, access_token: accessToken }),
      });
      const mediaData = await mediaRes.json();
      if (!mediaRes.ok) throw new Error(mediaData.error?.message || "Error al crear media en Instagram");

      const publishRes = await fetch(`${GRAPH_API}/${pageId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: mediaData.id, access_token: accessToken }),
      });
      const publishData = await publishRes.json();
      if (!publishRes.ok) throw new Error(publishData.error?.message || "Error al publicar en Instagram");
      return res.json({ success: true, postId: publishData.id, message: "¡Publicado en Instagram exitosamente!" });
    }

    /* ── Twitter / X ── */
    if (platform === "twitter") {
      const { apiKey, apiSecret, accessToken, accessTokenSecret } = credentials;
      const tweetUrl = "https://api.twitter.com/2/tweets";
      const text = content.length > 280 ? content.slice(0, 277) + "..." : content;
      const authHeader = buildTwitterOAuthHeader("POST", tweetUrl, apiKey, apiSecret, accessToken, accessTokenSecret);

      const twitterRes = await fetch(tweetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify({ text }),
      });
      const twitterData = await twitterRes.json();
      if (!twitterRes.ok) {
        throw new Error(twitterData.detail || twitterData.errors?.[0]?.message || "Error de Twitter API");
      }
      return res.json({ success: true, postId: twitterData.data?.id, message: "¡Tweet publicado exitosamente!" });
    }

    /* ── LinkedIn ── */
    if (platform === "linkedin") {
      const { accessToken } = credentials;
      const authorUrn = credentials.pageId?.startsWith("urn:")
        ? credentials.pageId
        : `urn:li:person:${credentials.pageId}`;

      const linkedinRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });
      const linkedinData = await linkedinRes.json();
      if (!linkedinRes.ok) {
        throw new Error(linkedinData.message || "Error de LinkedIn API");
      }
      return res.json({ success: true, postId: linkedinData.id, message: "¡Publicado en LinkedIn exitosamente!" });
    }

    /* ── TikTok ── */
    if (platform === "tiktok") {
      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          message: "TikTok requiere un video. Genera un video para esta campaña primero.",
        });
      }
      const { accessToken } = credentials;

      /* Consulta qué niveles de privacidad puede usar esta cuenta — las apps sin auditar
         de TikTok solo pueden publicar en privado (SELF_ONLY), no directo al feed público. */
      const creatorRes = await fetch(`${TIKTOK_API}/post/publish/creator_info/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8", Authorization: `Bearer ${accessToken}` },
      });
      const creatorData = await creatorRes.json();
      if (!creatorRes.ok || creatorData.error?.code !== "ok") {
        throw new Error(creatorData.error?.message || "Error al consultar la cuenta de TikTok");
      }

      const privacyOptions = creatorData.data?.privacy_level_options || [];
      const isPublicAllowed = privacyOptions.includes("PUBLIC_TO_EVERYONE");
      const privacyLevel = isPublicAllowed ? "PUBLIC_TO_EVERYONE" : privacyOptions[0] || "SELF_ONLY";

      const initRes = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          post_info: {
            title: content.length > 150 ? content.slice(0, 147) + "..." : content,
            privacy_level: privacyLevel,
          },
          source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || initData.error?.code !== "ok") {
        throw new Error(initData.error?.message || "Error al iniciar la publicación en TikTok");
      }

      return res.json({
        success: true,
        postId: initData.data?.publish_id,
        isDraft: !isPublicAllowed,
        message: isPublicAllowed
          ? "¡Video enviado a TikTok! Puede tardar unos minutos en procesarse."
          : "Video enviado a TikTok, pero quedó como borrador privado (tu app aún no está auditada por TikTok). Abre la app de TikTok para publicarlo manualmente.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Error al publicar: ${error.message}` });
  }
};

module.exports = { saveSocialCredentials, getSocialCredentials, disconnectSocialCredentials, publishContent };
