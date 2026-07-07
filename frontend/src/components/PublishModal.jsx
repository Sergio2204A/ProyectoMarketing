import { useState, useEffect } from "react";
import {
  publishContentAPI,
  getSocialCredentialsAPI,
  saveSocialCredentialsAPI,
  disconnectSocialAPI,
  getMetaConnectUrlAPI,
  getTikTokConnectUrlAPI,
} from "../services/publishService";

const PLATFORMS = [
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.1)",
    border: "rgba(24,119,242,0.35)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
    requiresImage: false,
    oauth: "meta",
    fields: [],
    note: "Se conecta junto con Instagram con un solo clic (misma cuenta de Meta).",
  },
  {
    id: "instagram",
    label: "Instagram",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.1)",
    border: "rgba(225,48,108,0.35)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#E1306C">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    requiresImage: true,
    oauth: "meta",
    fields: [],
    note: "Requiere que tu cuenta de Instagram sea Business/Creator y esté enlazada a la Página de Facebook elegida al conectar.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    color: "#25F4EE",
    bg: "rgba(37,244,238,0.1)",
    border: "rgba(37,244,238,0.35)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#25F4EE" }}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
    requiresVideo: true,
    oauth: "tiktok",
    fields: [],
    note: "Mientras la app no esté auditada por TikTok, el video queda como borrador privado — hay que abrir la app y publicarlo a mano.",
  },
  {
    id: "twitter",
    label: "Twitter / X",
    color: "#1DA1F2",
    bg: "rgba(29,161,242,0.1)",
    border: "rgba(29,161,242,0.35)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    requiresImage: false,
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
      { key: "apiSecret", label: "API Key Secret", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
      { key: "accessToken", label: "Access Token", placeholder: "1234567890-xxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
      { key: "accessTokenSecret", label: "Access Token Secret", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
    ],
    instructions: [
      "Ve a developer.twitter.com y crea un proyecto + app",
      "En 'Settings', activa permisos de Read and Write",
      "En 'Keys and Tokens', genera: API Key, API Secret, Access Token y Access Token Secret",
      "Asegúrate de que el Access Token tenga permisos de escritura (no solo lectura)",
      "El tweet se trunca automáticamente a 280 caracteres",
    ],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    bg: "rgba(10,102,194,0.1)",
    border: "rgba(10,102,194,0.35)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    requiresImage: false,
    fields: [
      { key: "accessToken", label: "Access Token OAuth 2.0", placeholder: "AQXxxxxxxxxxxxxxxxxx...", type: "text" },
      { key: "pageId", label: "Author URN", placeholder: "urn:li:person:XXXXXXXX", type: "text" },
    ],
    instructions: [
      "Ve a linkedin.com/developers y crea una app asociada a una Página de empresa",
      "Solicita los productos 'Share on LinkedIn' y 'Sign In with LinkedIn'",
      "En OAuth 2.0 tools genera un token con scopes: w_member_social, r_liteprofile",
      "El Author URN tiene el formato urn:li:person:XXXXXXXX (lo obtienes de GET /v2/me)",
      "Los tokens de LinkedIn expiran cada 60 días — recuerda renovarlos",
    ],
  },
];

const EMPTY_CREDS = { facebook: { connected: false }, instagram: { connected: false }, tiktok: { connected: false }, twitter: { connected: false }, linkedin: { connected: false } };

function PublishModal({ isOpen, onClose, content, imageUrl, videoUrl, activeTab }) {
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [credentials, setCredentials] = useState(EMPTY_CREDS);
  const [loadingCreds, setLoadingCreds] = useState(true);
  const [connectForm, setConnectForm] = useState({});
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectingOAuth, setConnectingOAuth] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform);
  const cred = credentials[selectedPlatform] || { connected: false };

  useEffect(() => {
    if (!isOpen) return;
    setPublishResult(null);
    setShowConnectForm(false);
    setShowInstructions(false);
    loadCredentials();
  }, [isOpen]);

  useEffect(() => {
    setPublishResult(null);
    setConnectForm({});
    setShowInstructions(false);
    setShowConnectForm(!(credentials[selectedPlatform]?.connected));
  }, [selectedPlatform]);

  const loadCredentials = async () => {
    setLoadingCreds(true);
    try {
      const data = await getSocialCredentialsAPI();
      setCredentials({ ...EMPTY_CREDS, ...data.credentials });
      setShowConnectForm(!(data.credentials[selectedPlatform]?.connected));
    } catch {
      // silencioso
    } finally {
      setLoadingCreds(false);
    }
  };

  const handleSaveCredentials = async () => {
    const allFilled = platform.fields.every((f) => (connectForm[f.key] || "").trim());
    if (!allFilled) return;
    setSaving(true);
    try {
      const creds = {};
      platform.fields.forEach((f) => { creds[f.key] = connectForm[f.key].trim(); });
      await saveSocialCredentialsAPI(selectedPlatform, creds);
      await loadCredentials();
      setConnectForm({});
      setShowConnectForm(false);
    } catch {
      // error silencioso
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectSocialAPI(selectedPlatform);
      await loadCredentials();
      setShowConnectForm(true);
    } catch {
      // silencioso
    } finally {
      setDisconnecting(false);
    }
  };

  const handleOAuthConnect = async () => {
    setConnectingOAuth(true);
    try {
      const { url } = platform.oauth === "meta" ? await getMetaConnectUrlAPI() : await getTikTokConnectUrlAPI();
      window.location.href = url;
    } catch {
      setConnectingOAuth(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishResult(null);
    try {
      const text = Array.isArray(content) ? content.join(" ") : content;
      const data = await publishContentAPI(selectedPlatform, text, imageUrl, videoUrl);
      setPublishResult({ ok: true, message: data.message, postId: data.postId, isDraft: data.isDraft });
    } catch (err) {
      const msg = err.response?.data?.message || "Error inesperado al publicar";
      setPublishResult({ ok: false, message: msg });
    } finally {
      setPublishing(false);
    }
  };

  const needsImageButMissing = platform?.requiresImage && !imageUrl;
  const needsVideoButMissing = platform?.requiresVideo && !videoUrl;
  const allFormFilled = platform?.fields.every((f) => (connectForm[f.key] || "").trim());

  if (!isOpen) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", width: "100%", maxWidth: "580px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "1.5rem 1.75rem 1rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ color: "var(--text-active)", fontWeight: "800", fontSize: "1.05rem", margin: 0 }}>
              Publicar en redes sociales
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
              Selecciona la plataforma y publica directamente
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Selector de plataforma — grid 2×2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.45rem",
                  padding: "0.65rem 0.5rem", borderRadius: "var(--border-radius-md)", cursor: "pointer",
                  border: `1px solid ${selectedPlatform === p.id ? p.border : "var(--border-color)"}`,
                  background: selectedPlatform === p.id ? p.bg : "transparent",
                  color: selectedPlatform === p.id ? p.color : "var(--text-soft)",
                  fontWeight: "700", fontSize: "0.85rem", transition: "all 0.2s",
                }}
              >
                {p.icon}
                {p.label}
              </button>
            ))}
          </div>

          {loadingCreds ? (
            <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>Cargando...</div>
          ) : (
            <>
              {/* Estado de conexión */}
              <div style={{ background: "var(--bg-tertiary)", border: `1px solid ${cred.connected ? "rgba(52,211,153,0.3)" : "var(--border-color)"}`, borderRadius: "var(--border-radius-md)", padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1rem" }}>{cred.connected ? "✅" : "⚠️"}</span>
                  <div>
                    <p style={{ color: cred.connected ? "#34d399" : "var(--text-soft)", fontWeight: "700", fontSize: "0.83rem", margin: 0 }}>
                      {cred.connected ? `${platform.label} conectado` : `${platform.label} no conectado`}
                    </p>
                    {cred.connected && (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", margin: 0 }}>
                        ID: {cred.pageId} · Token: {cred.tokenPreview}
                      </p>
                    )}
                  </div>
                </div>
                {cred.connected ? (
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: "var(--border-radius-sm)", padding: "0.3rem 0.75rem", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}
                  >
                    {disconnecting ? "..." : "Desconectar"}
                  </button>
                ) : !platform.oauth ? (
                  <button
                    onClick={() => { setShowConnectForm((v) => !v); setConnectForm({}); }}
                    style={{ background: platform.bg, border: `1px solid ${platform.border}`, color: platform.color, borderRadius: "var(--border-radius-sm)", padding: "0.3rem 0.75rem", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}
                  >
                    {showConnectForm ? "Cancelar" : "Conectar"}
                  </button>
                ) : null}
              </div>

              {/* Conexión OAuth (Meta / TikTok) — un solo clic, sin tokens manuales */}
              {!cred.connected && platform.oauth && (
                <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: "1.5", margin: 0 }}>{platform.note}</p>
                  <button
                    className="btn-primary"
                    onClick={handleOAuthConnect}
                    disabled={connectingOAuth}
                    style={{ height: "42px", fontSize: "0.88rem" }}
                  >
                    {connectingOAuth ? "Redirigiendo..." : `Conectar con ${platform.oauth === "meta" ? "Meta" : "TikTok"}`}
                  </button>
                </div>
              )}

              {/* Formulario de conexión manual — Twitter/LinkedIn (sin app OAuth configurada aún) */}
              {!cred.connected && !platform.oauth && showConnectForm && (
                <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ color: "var(--text-active)", fontWeight: "700", fontSize: "0.85rem", margin: 0 }}>
                      Conectar cuenta de {platform.label}
                    </p>
                    <button
                      onClick={() => setShowInstructions((v) => !v)}
                      style={{ background: "none", border: "none", color: platform.color, fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}
                    >
                      {showInstructions ? "Ocultar pasos" : "¿Cómo obtener el token?"}
                    </button>
                  </div>

                  {showInstructions && (
                    <ol style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {platform.instructions.map((step, i) => (
                        <li key={i} style={{ color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: "1.5" }}>{step}</li>
                      ))}
                    </ol>
                  )}

                  {platform.fields.map((field) => (
                    <div key={field.key}>
                      <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        autoComplete="new-password"
                        value={connectForm[field.key] || ""}
                        onChange={(e) => setConnectForm((f) => ({ ...f, [field.key]: e.target.value }))}
                        style={{ width: "100%", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.8rem", color: "var(--text-active)", fontSize: "0.83rem", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}

                  <button
                    className="btn-primary"
                    onClick={handleSaveCredentials}
                    disabled={saving || !allFormFilled}
                    style={{ height: "40px", fontSize: "0.85rem" }}
                  >
                    {saving ? "Guardando..." : "Guardar y conectar"}
                  </button>
                </div>
              )}

              {/* Preview del contenido y botón publicar */}
              {cred.connected && (
                <>
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
                      Vista previa de la publicación
                      {selectedPlatform === "twitter" && <span style={{ marginLeft: "0.5rem", color: "#1DA1F2", fontWeight: "600" }}>(máx. 280 car.)</span>}
                    </p>
                    <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "1rem", fontSize: "0.83rem", color: "var(--text-soft)", lineHeight: "1.65", maxHeight: "140px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                      {Array.isArray(content) ? content.join(" ") : content}
                    </div>
                  </div>

                  {/* Aviso Instagram sin imagen */}
                  {needsImageButMissing && (
                    <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "var(--border-radius-md)", padding: "0.85rem 1rem", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
                      <p style={{ color: "#fbbf24", fontSize: "0.78rem", lineHeight: "1.5", margin: 0 }}>
                        Instagram requiere una imagen para publicar. Genera una imagen para esta campaña desde la sección "Imagen para la campaña" y luego vuelve aquí.
                      </p>
                    </div>
                  )}

                  {/* Aviso TikTok sin video */}
                  {needsVideoButMissing && (
                    <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "var(--border-radius-md)", padding: "0.85rem 1rem", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
                      <p style={{ color: "#fbbf24", fontSize: "0.78rem", lineHeight: "1.5", margin: 0 }}>
                        TikTok requiere un video para publicar. Genera o adjunta un video para esta campaña y luego vuelve aquí.
                      </p>
                    </div>
                  )}

                  {/* Resultado de publicación */}
                  {publishResult && (
                    <div style={{
                      background: publishResult.ok ? (publishResult.isDraft ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)") : "rgba(248,113,113,0.08)",
                      border: `1px solid ${publishResult.ok ? (publishResult.isDraft ? "rgba(251,191,36,0.3)" : "rgba(52,211,153,0.3)") : "rgba(248,113,113,0.3)"}`,
                      borderRadius: "var(--border-radius-md)", padding: "0.9rem 1.1rem",
                    }}>
                      <p style={{ color: publishResult.ok ? (publishResult.isDraft ? "#fbbf24" : "#34d399") : "#f87171", fontWeight: "700", fontSize: "0.85rem", margin: 0 }}>
                        {publishResult.ok ? (publishResult.isDraft ? "⚠️ " : "✅ ") : "❌ "}{publishResult.message}
                      </p>
                      {publishResult.ok && publishResult.postId && (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.25rem", marginBottom: 0 }}>
                          Post ID: {publishResult.postId}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Botón publicar */}
                  {!publishResult?.ok && (
                    <button
                      className="btn-primary"
                      onClick={handlePublish}
                      disabled={publishing || needsImageButMissing || needsVideoButMissing}
                      style={{ height: "46px", fontSize: "0.92rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                    >
                      {publishing ? (
                        <><span className="pulse-element">⏳</span> Publicando...</>
                      ) : (
                        <>{platform.icon} Publicar en {platform.label}</>
                      )}
                    </button>
                  )}
                  {publishResult?.ok && (
                    <button
                      onClick={onClose}
                      style={{ height: "42px", fontSize: "0.85rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-soft)", borderRadius: "var(--border-radius-md)", cursor: "pointer" }}
                    >
                      Cerrar
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublishModal;
