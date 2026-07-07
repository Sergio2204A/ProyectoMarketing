const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/tokenCrypto");

const GRAPH_API = "https://graph.facebook.com/v21.0";
const TIKTOK_API = "https://open.tiktokapis.com/v2";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/* ── State firmado: liga el callback (llamado por Facebook/TikTok, sin cookies de sesión) al usuario que inició la conexión ── */
function signState(userId) {
  return jwt.sign({ uid: userId }, process.env.JWT_SECRET, { expiresIn: "10m" });
}

function verifyState(state) {
  const decoded = jwt.verify(state, process.env.JWT_SECRET);
  return decoded.uid;
}

function redirectWithStatus(res, status) {
  res.redirect(`${FRONTEND_URL}/?social=${status}`);
}

/* ═══════════════ META (Facebook + Instagram) ═══════════════ */

const getMetaConnectUrl = async (req, res) => {
  const state = signState(req.user._id.toString());
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: process.env.META_REDIRECT_URI,
    state,
    scope: [
      "pages_show_list",
      "pages_manage_posts",
      "pages_read_engagement",
      "instagram_basic",
      "instagram_content_publish",
      "business_management",
    ].join(","),
    response_type: "code",
  });
  res.json({ success: true, url: `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}` });
};

const metaCallback = async (req, res) => {
  const { code, state, error } = req.query;

  if (error) return redirectWithStatus(res, "meta_error");

  let userId;
  try {
    userId = verifyState(state);
  } catch {
    return redirectWithStatus(res, "meta_error");
  }

  try {
    /* 1. code → token de usuario de corta duración */
    const shortTokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?` +
        new URLSearchParams({
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code,
        })
    );
    const shortTokenData = await shortTokenRes.json();
    if (!shortTokenRes.ok) throw new Error(shortTokenData.error?.message || "Error al intercambiar el código de Meta");

    /* 2. token corto → token de usuario de larga duración (~60 días) */
    const longTokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: shortTokenData.access_token,
        })
    );
    const longTokenData = await longTokenRes.json();
    if (!longTokenRes.ok) throw new Error(longTokenData.error?.message || "Error al extender el token de Meta");

    /* 3. Páginas administradas por el usuario (el token de página heredado de un token largo no expira) */
    const pagesRes = await fetch(
      `${GRAPH_API}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${longTokenData.access_token}`
    );
    const pagesData = await pagesRes.json();
    if (!pagesRes.ok) throw new Error(pagesData.error?.message || "Error al listar páginas de Meta");

    const pages = pagesData.data || [];
    if (pages.length === 0) {
      return redirectWithStatus(res, "meta_no_pages");
    }

    if (pages.length > 1) {
      /* Varias páginas: se guardan cifradas como pendientes y el usuario elige una en el frontend */
      await User.findByIdAndUpdate(userId, {
        $set: { "socialTokens.metaPendingPages": encrypt(pages) },
      });
      return redirectWithStatus(res, "meta_select_page");
    }

    await saveMetaPageSelection(userId, pages[0]);
    return redirectWithStatus(res, "meta_connected");
  } catch (err) {
    console.error("Error en metaCallback:", err.message);
    return redirectWithStatus(res, "meta_error");
  }
};

async function saveMetaPageSelection(userId, page) {
  const facebookCreds = { pageId: page.id, pageName: page.name, accessToken: page.access_token };
  const update = { "socialTokens.facebook": encrypt(facebookCreds) };

  if (page.instagram_business_account?.id) {
    update["socialTokens.instagram"] = encrypt({
      pageId: page.instagram_business_account.id,
      username: page.instagram_business_account.username,
      accessToken: page.access_token,
    });
  }

  await User.findByIdAndUpdate(userId, { $set: update, $unset: { "socialTokens.metaPendingPages": "" } });
}

const listMetaPendingPages = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+socialTokens");
    const pending = decrypt(user.socialTokens?.metaPendingPages);
    if (!pending) return res.status(404).json({ success: false, message: "No hay páginas pendientes de selección" });
    res.json({
      success: true,
      pages: pending.map((p) => ({
        id: p.id,
        name: p.name,
        hasInstagram: !!p.instagram_business_account?.id,
        instagramUsername: p.instagram_business_account?.username || null,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener páginas pendientes" });
  }
};

const selectMetaPage = async (req, res) => {
  try {
    const { pageId } = req.body;
    const user = await User.findById(req.user._id).select("+socialTokens");
    const pending = decrypt(user.socialTokens?.metaPendingPages);
    const page = pending?.find((p) => p.id === pageId);
    if (!page) return res.status(400).json({ success: false, message: "Página no válida" });

    await saveMetaPageSelection(req.user._id, page);
    res.json({ success: true, message: "Página conectada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al seleccionar la página" });
  }
};

/* ═══════════════ TIKTOK ═══════════════ */

const getTikTokConnectUrl = async (req, res) => {
  const state = signState(req.user._id.toString());
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    redirect_uri: process.env.TIKTOK_REDIRECT_URI,
    state,
    scope: "user.info.basic,video.publish",
    response_type: "code",
  });
  res.json({ success: true, url: `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}` });
};

const tiktokCallback = async (req, res) => {
  const { code, state, error } = req.query;

  if (error) return redirectWithStatus(res, "tiktok_error");

  let userId;
  try {
    userId = verifyState(state);
  } catch {
    return redirectWithStatus(res, "tiktok_error");
  }

  try {
    const tokenRes = await fetch(`${TIKTOK_API}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error || "Error al obtener el token de TikTok");
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        "socialTokens.tiktok": encrypt({
          openId: tokenData.open_id,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          accessTokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
          refreshTokenExpiresAt: Date.now() + tokenData.refresh_expires_in * 1000,
        }),
      },
    });

    return redirectWithStatus(res, "tiktok_connected");
  } catch (err) {
    console.error("Error en tiktokCallback:", err.message);
    return redirectWithStatus(res, "tiktok_error");
  }
};

/* Refresco perezoso: renueva el access token de TikTok si está por expirar, antes de publicar */
async function ensureFreshTikTokToken(user) {
  const creds = decrypt(user.socialTokens?.tiktok);
  if (!creds) return null;

  const isExpiringSoon = creds.accessTokenExpiresAt - Date.now() < 5 * 60 * 1000;
  if (!isExpiringSoon) return creds;

  const refreshRes = await fetch(`${TIKTOK_API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: creds.refreshToken,
    }),
  });
  const refreshData = await refreshRes.json();
  if (!refreshRes.ok || refreshData.error) {
    throw new Error(refreshData.error_description || "El token de TikTok expiró y no se pudo renovar. Reconecta tu cuenta.");
  }

  const updated = {
    openId: refreshData.open_id,
    accessToken: refreshData.access_token,
    refreshToken: refreshData.refresh_token,
    accessTokenExpiresAt: Date.now() + refreshData.expires_in * 1000,
    refreshTokenExpiresAt: Date.now() + refreshData.refresh_expires_in * 1000,
  };
  await User.findByIdAndUpdate(user._id, { $set: { "socialTokens.tiktok": encrypt(updated) } });
  return updated;
}

module.exports = {
  getMetaConnectUrl,
  metaCallback,
  listMetaPendingPages,
  selectMetaPage,
  getTikTokConnectUrl,
  tiktokCallback,
  ensureFreshTikTokToken,
};
