import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CampaignForm from "../components/CampaignForm";
import ResultCard from "../components/ResultCard";
import PublishModal from "../components/PublishModal";
import {
  getSocialCredentialsAPI,
  saveSocialCredentialsAPI,
  disconnectSocialAPI,
  getMetaConnectUrlAPI,
  getTikTokConnectUrlAPI,
  getMetaPendingPagesAPI,
  selectMetaPageAPI,
} from "../services/publishService";
import {
  generateCampaign,
  generateCopy,
  generateHashtags,
  generateCalendar,
  getHistory,
  deleteHistoryItemAPI,
  clearHistoryAPI,
  toggleFavoriteAPI,
  generateTrendsAPI,
  refineContentAPI,
  updateImageUrlAPI,
  generateVideoScriptAPI,
  generateRealVideoAPI,
  getRealVideoStatusAPI,
  generateImageOpenAIAPI,
  videoScriptChatAPI,
  updateOutputAPI,
  updateVideoUrlAPI,
  saveGenerationAPI,
} from "../services/campaignService";

const TYPE_LABELS = { campaign: "Campaña", copy: "Copy", hashtag: "Hashtags", calendar: "Calendario", video: "Video Script" };

function Home() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [generationId, setGenerationId] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({ product: "", goal: "", audience: "", channel: "", country: "", region: "" });

  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calEvents, setCalEvents] = useState([
    { date: "2026-06-10", title: "Campaña FB Ads", type: "purple" },
    { date: "2026-06-18", title: "#TrendingNow", type: "coral" },
  ]);
  const [calModal, setCalModal] = useState(false);
  const [calForm, setCalForm] = useState({ title: "", date: "", type: "purple" });

  const DEFAULT_TRENDS = [
    { id: "d1", title: "🚀 Video Corto", description: "Reels e historias de menos de 15 seg siguen liderando el alcance orgánico en 2026.", color: "#f5b27a" },
    { id: "d2", title: "🤖 Personalización IA", description: "Copys adaptados a micro-nichos con llamadas de acción ultra-específicas incrementan conversión +35%.", color: "#38bdf8" },
    { id: "d3", title: "📊 Transparencia de Datos", description: "Mostrar estadísticas reales en el primer párrafo baja el costo por lead en LinkedIn.", color: "#34d399" },
  ];
  const [trends, setTrends] = useState(DEFAULT_TRENDS);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsTopic, setTrendsTopic] = useState("");
  const [manualModal, setManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ title: "", description: "", color: "#f5b27a" });
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historySearch, setHistorySearch] = useState("");
  const [refineModal, setRefineModal] = useState(null);
  const [refineResult, setRefineResult] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [detailEditMode, setDetailEditMode] = useState(false);
  const [detailEditContent, setDetailEditContent] = useState("");
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailImageUrl, setDetailImageUrl] = useState(null);
  const [detailImageLoading, setDetailImageLoading] = useState(false);
  const [detailImageError, setDetailImageError] = useState(false);
  const [detailImagePrompt, setDetailImagePrompt] = useState("");
  const [detailVideoForm, setDetailVideoForm] = useState({ format: "Reel de Instagram", duration: "30 segundos" });
  const [detailVideoResult, setDetailVideoResult] = useState(null);
  const [detailVideoLoading, setDetailVideoLoading] = useState(false);
  const [detailAttachedVideo, setDetailAttachedVideo] = useState(null);
  const [detailVideoLinkInput, setDetailVideoLinkInput] = useState("");
  const detailVideoFileRef = useRef(null);
  const [publishModalOpen, setPublishModalOpen] = useState(null);
  const [socialCreds, setSocialCreds] = useState({ facebook: { connected: false }, instagram: { connected: false }, tiktok: { connected: false }, twitter: { connected: false }, linkedin: { connected: false } });
  const [socialLoadingCreds, setSocialLoadingCreds] = useState(false);
  const [socialOpenForm, setSocialOpenForm] = useState(null);
  const [socialForm, setSocialForm] = useState({});
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialConnecting, setSocialConnecting] = useState(null);
  const [socialDisconnecting, setSocialDisconnecting] = useState(null);
  const [socialShowInstructions, setSocialShowInstructions] = useState(null);
  const [metaPendingPages, setMetaPendingPages] = useState(null);
  const [metaSelectingPage, setMetaSelectingPage] = useState(false);
  const [calAiForm, setCalAiForm] = useState({ product: "", platform: "Instagram", goal: "" });
  const [calAiLoading, setCalAiLoading] = useState(false);

  const [videoForm, setVideoForm] = useState({ product: "", format: "Reel de Instagram", duration: "30 segundos", goal: "", audience: "" });
  const [videoResult, setVideoResult] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoGenerationId, setVideoGenerationId] = useState(null);

  const [videoStudioMessages, setVideoStudioMessages] = useState([]);
  const [videoStudioInput, setVideoStudioInput] = useState("");
  const [videoStudioLoading, setVideoStudioLoading] = useState(false);
  const [videoStudioContext, setVideoStudioContext] = useState({ format: "Reel de Instagram", duration: "30 segundos", product: "", goal: "", audience: "" });
  const [videoStudioFile, setVideoStudioFile] = useState(null);
  const [videoStudioFilePreview, setVideoStudioFilePreview] = useState(null);
  const videoStudioFileRef = useRef(null);
  const videoStudioBottomRef = useRef(null);
  const videoAttachFileRef = useRef(null);
  const [videoAttachTargetId, setVideoAttachTargetId] = useState(null);
  const [videoAttachLinkInputs, setVideoAttachLinkInputs] = useState({});

  const [studioMessages, setStudioMessages] = useState([]);
  const [studioPrompt, setStudioPrompt] = useState("");
  const [studioFile, setStudioFile] = useState(null);
  const [studioFilePreview, setStudioFilePreview] = useState(null);
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioSize, setStudioSize] = useState("1024x1024");
  const studioFileRef = useRef(null);
  const studioBottomRef = useRef(null);

  const [realVideoDuration, setRealVideoDuration] = useState(5);
  const [realVideoStatus, setRealVideoStatus] = useState("idle"); // idle | starting | processing | done | error
  const [realVideoUrl, setRealVideoUrl] = useState(null);
  const [realVideoError, setRealVideoError] = useState("");
  const realVideoPollRef = useRef(null);

  const [inlineVideoForm, setInlineVideoForm] = useState({ format: "Reel de Instagram", duration: "30 segundos" });
  const [inlineVideoResult, setInlineVideoResult] = useState(null);
  const [inlineVideoLoading, setInlineVideoLoading] = useState(false);

  const prevTabRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getHistory();
      setHistory(data.history);
    } catch (err) {
      showToast("Error al cargar el historial", "error");
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => { if (activeTab === "social") loadSocialCreds(); }, [activeTab]);

  /* ── Retorno del OAuth de Meta/TikTok (el backend redirige aquí con ?social=...) ── */
  useEffect(() => {
    const social = new URLSearchParams(window.location.search).get("social");
    if (!social) return;
    window.history.replaceState({}, "", window.location.pathname);

    const MESSAGES = {
      meta_connected: ["Facebook e Instagram conectados ✓", "success"],
      meta_select_page: ["Elige qué página de Facebook usar para conectar", "info"],
      meta_no_pages: ["Tu cuenta de Facebook no administra ninguna Página. Crea una Página primero.", "error"],
      meta_error: ["No se pudo conectar con Meta. Intenta de nuevo.", "error"],
      tiktok_connected: ["TikTok conectado ✓", "success"],
      tiktok_error: ["No se pudo conectar con TikTok. Intenta de nuevo.", "error"],
    };
    const [message, type] = MESSAGES[social] || ["Listo", "info"];
    showToast(message, type);

    if (social === "meta_select_page") {
      getMetaPendingPagesAPI().then((data) => setMetaPendingPages(data.pages)).catch(() => {});
    } else {
      loadSocialCreds();
    }
  }, []);
  useEffect(() => {
    const prevTab = prevTabRef.current;
    prevTabRef.current = activeTab;
    const GEN_TABS = new Set(["campaign", "copy", "hashtag", "video"]);
    // Solo limpia el resultado al cambiar ENTRE tabs de generación (ej: campaign→copy)
    // Si el usuario va a social/dashboard/calendar y vuelve, el resultado se preserva
    if (GEN_TABS.has(prevTab) && GEN_TABS.has(activeTab) && prevTab !== activeTab) {
      setResult(""); setGenerationId(null); setImageUrl(null); setImageError(false); setImagePrompt("");
      setVideoResult(null); setVideoGenerationId(null);
    }
  }, [activeTab]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    setGenerationId(null);
    setImageUrl(null);
    setImageError(false);
    setInlineVideoResult(null);
    try {
      let response;
      if (activeTab === "campaign") { response = await generateCampaign(formData); setResult(response.campaign); }
      else if (activeTab === "copy") { response = await generateCopy({ product: formData.product, audience: formData.audience }); setResult(response.copy); }
      else if (activeTab === "hashtag") { response = await generateHashtags({ product: formData.product }); setResult(response.hashtags); }
      setGenerationId(response?.generationId || null);
      showToast("Contenido generado exitosamente", "success");
      await loadHistory();
    } catch (error) {
      showToast("Error al generar contenido. Verifica que el servidor esté corriendo.", "error");
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const data = await toggleFavoriteAPI(id);
      setHistory((prev) => prev.map((item) => item._id === id ? { ...item, isFavorite: data.isFavorite } : item));
      showToast(data.isFavorite ? "Agregado a favoritos ⭐" : "Quitado de favoritos", "info");
    } catch (err) { showToast("Error al actualizar favorito", "error"); }
  };

  const handleGenerateCalendarAI = async () => {
    if (!calAiForm.product.trim() || !calAiForm.goal.trim()) return;
    setCalAiLoading(true);
    try {
      const data = await generateCalendar(calAiForm);
      const DAY_MAP = { Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6, Domingo: 0 };
      const now = new Date();
      const daysToMonday = now.getDay() === 0 ? 1 : 8 - now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() + daysToMonday);
      const newEvents = data.calendar.map((item) => {
        const offset = DAY_MAP[item.day] === 0 ? 6 : DAY_MAP[item.day] - 1;
        const date = new Date(monday);
        date.setDate(monday.getDate() + offset);
        return { date: `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`, title: item.topic, type: "teal" };
      });
      setCalEvents((prev) => [...prev, ...newEvents]);
      const firstDate = newEvents[0]?.date.split("-");
      if (firstDate) { setCalYear(parseInt(firstDate[0])); setCalMonth(parseInt(firstDate[1]) - 1); }
      showToast("Calendario generado y agregado ✓", "success");
      setActiveTab("calendar");
    } catch (err) { showToast("Error al generar el calendario", "error"); }
    finally { setCalAiLoading(false); }
  };

  const deleteHistoryItem = async (id) => {
    try { await deleteHistoryItemAPI(id); setHistory((prev) => prev.filter((item) => item._id !== id)); showToast("Elemento eliminado", "info"); }
    catch (err) { showToast("Error al eliminar", "error"); }
  };

  const clearHistory = async () => {
    try { await clearHistoryAPI(); setHistory([]); showToast("Historial limpiado", "info"); }
    catch (err) { showToast("Error al limpiar historial", "error"); }
  };

  const handleRefine = async () => {
    if (!refineModal) return;
    setRefineLoading(true);
    setRefineResult("");
    try {
      const data = await refineContentAPI(refineModal.type, refineModal.input, refineModal.output);
      setRefineResult(data.refined);
      showToast("¡Contenido perfeccionado con IA ✨", "success");
      await loadHistory();
    } catch (err) {
      showToast("Error al perfeccionar el contenido", "error");
    } finally {
      setRefineLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setImageUrl(null);
    setImageError(false);
    setImageLoading(true);
    let prompt;
    if (imagePrompt.trim()) {
      prompt = `${imagePrompt.trim()}, professional marketing photo, no text, no watermark, no letters, high quality, 4k`;
    } else {
      const parts = [
        `professional marketing advertisement for ${formData.product}`,
        formData.goal ? `goal: ${formData.goal}` : "",
        formData.audience ? `target audience: ${formData.audience}` : "",
        formData.channel ? `for ${formData.channel}` : "",
        "modern commercial photography, vibrant colors, clean layout, high quality, 4k, professional brand design, no text, no letters, no watermark",
      ].filter(Boolean);
      prompt = parts.join(", ");
    }
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=576&nologo=true&model=flux&seed=${Date.now()}`;
    setImageUrl(url);

    if (generationId) {
      try {
        await updateImageUrlAPI(String(generationId), url);
        setHistory((prev) =>
          prev.map((item) =>
            String(item._id) === String(generationId) ? { ...item, imageUrl: url } : item
          )
        );
      } catch (err) {
        showToast("No se pudo guardar la imagen en el historial", "error");
      }
    }
  };

  const handleImageLoaded = () => {
    setImageLoading(false);
  };

  const outputToString = (output) => {
    if (!output) return "";
    if (Array.isArray(output)) return output.join("\n");
    if (typeof output === "object") return JSON.stringify(output, null, 2);
    return output;
  };

  const openDetailModal = (item) => {
    setDetailModal(item);
    setDetailEditMode(false);
    setDetailEditContent(outputToString(item.output));
    setDetailImageUrl(item.imageUrl || null);
    setDetailImagePrompt("");
    setDetailImageError(false);
    setDetailImageLoading(false);
    setDetailVideoResult(null);
    setDetailVideoLoading(false);
    setDetailAttachedVideo(item.videoUrl || null);
    setDetailVideoLinkInput("");
  };

  const closeDetailModal = () => {
    setDetailModal(null);
    setDetailEditMode(false);
    setDetailEditContent("");
    setDetailImageUrl(null);
    setDetailImagePrompt("");
    setDetailImageError(false);
    setDetailVideoResult(null);
    setDetailAttachedVideo(null);
    setDetailVideoLinkInput("");
  };

  const handleSaveEdit = async () => {
    if (!detailModal) return;
    setDetailSaving(true);
    try {
      let parsed = detailEditContent;
      try { parsed = JSON.parse(detailEditContent); } catch {}
      await updateOutputAPI(String(detailModal._id), parsed);
      setDetailModal((prev) => ({ ...prev, output: parsed }));
      setHistory((prev) => prev.map((h) => h._id === detailModal._id ? { ...h, output: parsed } : h));
      setDetailEditMode(false);
      showToast("Contenido guardado ✓", "success");
    } catch {
      showToast("No se pudo guardar", "error");
    } finally {
      setDetailSaving(false);
    }
  };

  const handleGenerateDetailImage = () => {
    setDetailImageError(false);
    setDetailImageLoading(true);
    const input = detailModal?.input || {};
    let prompt;
    if (detailImagePrompt.trim()) {
      prompt = `${detailImagePrompt.trim()}, professional marketing photo, no text, no watermark, no letters, high quality, 4k`;
    } else {
      const parts = [
        `professional marketing advertisement for ${input.product}`,
        input.goal ? `goal: ${input.goal}` : "",
        input.audience ? `target audience: ${input.audience}` : "",
        input.channel ? `for ${input.channel}` : "",
        "modern commercial photography, vibrant colors, clean layout, high quality, 4k, professional brand design, no text, no letters, no watermark",
      ].filter(Boolean);
      prompt = parts.join(", ");
    }
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=576&nologo=true&model=flux&seed=${Date.now()}`;
    setDetailImageUrl(url);
    updateImageUrlAPI(String(detailModal._id), url)
      .then(() => setHistory((prev) => prev.map((h) => h._id === detailModal._id ? { ...h, imageUrl: url } : h)))
      .catch(() => showToast("No se pudo guardar la imagen", "error"));
  };

  const handleDownloadDetailImage = async () => {
    if (!detailImageUrl) return;
    try {
      const res = await fetch(detailImageUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `imagen-${detailModal?.input?.product || "campaña"}-${Date.now()}.jpg`;
      a.click();
    } catch { showToast("Error al descargar la imagen", "error"); }
  };

  const handleGenerateDetailVideo = async () => {
    setDetailVideoLoading(true);
    setDetailVideoResult(null);
    try {
      const input = detailModal?.input || {};
      const data = await generateVideoScriptAPI({
        product: input.product,
        format: detailVideoForm.format,
        duration: detailVideoForm.duration,
        goal: input.goal || "generar engagement y ventas",
        audience: input.audience || "público general",
        country: input.country,
        region: input.region,
      });
      setDetailVideoResult(data.script);
      showToast("Script de video generado ✓", "success");
      await loadHistory();
    } catch {
      showToast("Error al generar el script de video", "error");
    } finally {
      setDetailVideoLoading(false);
    }
  };

  const handleDownloadDetailVideo = () => {
    if (!detailVideoResult) return;
    const input = detailModal?.input || {};
    const lines = [
      `SCRIPT DE VIDEO — ${input.product}`,
      `Formato: ${detailVideoForm.format} | Duración: ${detailVideoForm.duration}`,
      "",
      `🎣 HOOK: ${detailVideoResult.hook}`,
      "",
      "🎬 ESCENAS:",
      ...(detailVideoResult.scenes || []).map((s, i) =>
        `  Escena ${i + 1} (${s.time})\n  Visual: ${s.visual}\n  Narración: ${s.narration}\n  Transición: ${s.transition}`
      ),
      "",
      `📝 CAPTION:\n${detailVideoResult.caption}`,
      "",
      `🚀 CTA: ${detailVideoResult.cta}`,
      "",
      `🎵 MÚSICA: ${detailVideoResult.musicTip}`,
      "",
      `💡 TIPS:\n${detailVideoResult.productionTips}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-script-${input.product}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateInlineVideo = async () => {
    setInlineVideoLoading(true);
    setInlineVideoResult(null);
    try {
      const data = await generateVideoScriptAPI({
        product: formData.product,
        format: inlineVideoForm.format,
        duration: inlineVideoForm.duration,
        goal: formData.goal || "generar engagement y ventas",
        audience: formData.audience || "público general",
        country: formData.country,
        region: formData.region,
      });
      setInlineVideoResult(data.script);
      showToast("Script de video generado ✓", "success");
      await loadHistory();
    } catch {
      showToast("Error al generar el script de video", "error");
    } finally {
      setInlineVideoLoading(false);
    }
  };

  const handleDownloadInlineVideo = () => {
    if (!inlineVideoResult) return;
    const lines = [
      `SCRIPT DE VIDEO — ${formData.product}`,
      `Formato: ${inlineVideoForm.format} | Duración: ${inlineVideoForm.duration}`,
      "",
      `🎣 HOOK: ${inlineVideoResult.hook}`,
      "",
      "🎬 ESCENAS:",
      ...(inlineVideoResult.scenes || []).map((s, i) =>
        `  Escena ${i + 1} (${s.time})\n  Visual: ${s.visual}\n  Narración: ${s.narration}\n  Transición: ${s.transition}`
      ),
      "",
      `📝 CAPTION:\n${inlineVideoResult.caption}`,
      "",
      `🚀 CTA: ${inlineVideoResult.cta}`,
      "",
      `🎵 MÚSICA: ${inlineVideoResult.musicTip}`,
      "",
      `💡 TIPS:\n${inlineVideoResult.productionTips}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-script-${formData.product}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `imagen-${formData.product || "campaña"}-${Date.now()}.jpg`;
      a.click();
    } catch {
      showToast("Error al descargar la imagen", "error");
    }
  };

  const handleCopyRefineResult = () => {
    if (!refineResult) return;
    navigator.clipboard.writeText(refineResult);
    showToast("Resultado copiado ✓", "success");
  };

  const handleDownloadRefineResult = () => {
    if (!refineResult) return;
    const blob = new Blob([refineResult], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${refineModal.type}-perfeccionado-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── DASHBOARD EJECUTIVO ── */
  const renderDashboard = () => {
    const firstName = user?.name?.split(" ")[0] || "Usuario";
    const totalCampaigns = history.filter((h) => h.type === "campaign").length;
    const totalCopys = history.filter((h) => h.type === "copy").length;
    const totalHashtags = history.filter((h) => h.type === "hashtag").length;
    const totalFavs = history.filter((h) => h.isFavorite).length;
    const recentFive = history.slice(0, 5);
    const badgeClass = (type) => `activity-badge badge-${type}`;
    const timeAgo = (dateStr) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "ahora";
      if (m < 60) return `${m}m`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h`;
      return `${Math.floor(h / 24)}d`;
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-active)", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            Buen día, {firstName} 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.3rem" }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: "rgba(201,105,43,0.12)" }}>📊</div>
            <div className="metric-value">{history.length}</div>
            <div className="metric-label">Total generado</div>
            <div className="metric-sub">Creaciones acumuladas</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: "rgba(180,90,30,0.12)" }}>⚡</div>
            <div className="metric-value">{totalCampaigns}</div>
            <div className="metric-label">Campañas</div>
            <div className="metric-sub">Estrategias creadas</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: "rgba(150,100,40,0.12)" }}>✍️</div>
            <div className="metric-value">{totalCopys + totalHashtags}</div>
            <div className="metric-label">Copys & Hashtags</div>
            <div className="metric-sub">Textos generados</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: "rgba(250,200,50,0.1)" }}>⭐</div>
            <div className="metric-value">{totalFavs}</div>
            <div className="metric-label">Favoritos</div>
            <div className="metric-sub">Guardados para usar</div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-title">Acciones rápidas</span>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => setActiveTab("campaign")}>
                <span className="quick-action-icon">⚡</span>Nueva Campaña
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab("copy")}>
                <span className="quick-action-icon">✍️</span>Generar Copy
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab("hashtag")}>
                <span className="quick-action-icon">#</span>Hashtags
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab("calendar")}>
                <span className="quick-action-icon">📅</span>Calendario
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab("trends")}>
                <span className="quick-action-icon">📈</span>Tendencias
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab("video")}>
                <span className="quick-action-icon">🎬</span>Video Studio
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab("imagestudio")}>
                <span className="quick-action-icon">🎨</span>Estudio de Imagen
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab("history")}>
                <span className="quick-action-icon">🕒</span>Historial
              </button>
            </div>

            <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-color)" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.8rem" }}>
                Generar semana con IA
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="text" placeholder="Producto o servicio" value={calAiForm.product}
                    onChange={(e) => setCalAiForm((f) => ({ ...f, product: e.target.value }))}
                    style={{ flex: 1, backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.8rem", color: "var(--text-main)", fontSize: "0.82rem", outline: "none" }} />
                  <select value={calAiForm.platform} onChange={(e) => setCalAiForm((f) => ({ ...f, platform: e.target.value }))}
                    style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.8rem", color: "var(--text-main)", fontSize: "0.82rem", outline: "none" }}>
                    {["Instagram","TikTok","Facebook","LinkedIn","Twitter"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="text" placeholder="Objetivo (ej: aumentar seguidores)" value={calAiForm.goal}
                    onChange={(e) => setCalAiForm((f) => ({ ...f, goal: e.target.value }))}
                    style={{ flex: 1, backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.8rem", color: "var(--text-main)", fontSize: "0.82rem", outline: "none" }} />
                  <button className="btn-primary" onClick={handleGenerateCalendarAI}
                    disabled={calAiLoading || !calAiForm.product.trim() || !calAiForm.goal.trim()}
                    style={{ whiteSpace: "nowrap", fontSize: "0.82rem", padding: "0 1rem", height: "36px" }}>
                    {calAiLoading ? "..." : "Generar →"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <span className="section-title">Actividad reciente</span>
              {history.length > 0 && (
                <button onClick={() => setActiveTab("history")}
                  style={{ fontSize: "0.78rem", color: "var(--accent-secondary)", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>
                  Ver todo →
                </button>
              )}
            </div>
            {recentFive.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚀</div>
                Genera tu primera pieza para verla aquí.
              </div>
            ) : (
              <div className="activity-list">
                {recentFive.map((item) => (
                  <div key={item._id} className="activity-item">
                    <span className={badgeClass(item.type)}>{TYPE_LABELS[item.type] || item.type}</span>
                    <span className="activity-product">{item.input?.product || "—"}</span>
                    <span className="activity-time">{timeAgo(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── CALENDARIO ── */
  const renderCalendar = () => {
    const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y-1); } else setCalMonth((m) => m-1); };
    const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y+1); } else setCalMonth((m) => m+1); };
    const openModal = (date = "") => {
      const d = date || `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
      setCalForm({ title: "", date: d, type: "purple" });
      setCalModal(true);
    };
    const saveEvent = () => {
      if (!calForm.title.trim() || !calForm.date) return;
      setCalEvents((prev) => [...prev, { ...calForm }]);
      const [y, m] = calForm.date.split("-");
      setCalYear(parseInt(y)); setCalMonth(parseInt(m)-1);
      setCalModal(false);
    };
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
    const daysInPrev = new Date(calYear, calMonth, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: daysInPrev - firstDay + i + 1, current: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="section-card">
          <h3 style={{ color: "var(--text-active)", marginBottom: "1rem", fontSize: "0.95rem", fontWeight: "700" }}>Generar semana con IA</h3>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input type="text" placeholder="Producto o servicio" value={calAiForm.product}
              onChange={(e) => setCalAiForm((f) => ({ ...f, product: e.target.value }))}
              style={{ flex: 1, minWidth: "150px", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.9rem", color: "var(--text-active)", fontSize: "0.85rem", outline: "none" }} />
            <select value={calAiForm.platform} onChange={(e) => setCalAiForm((f) => ({ ...f, platform: e.target.value }))}
              style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.9rem", color: "var(--text-active)", fontSize: "0.85rem", outline: "none" }}>
              {["Instagram","TikTok","Facebook","LinkedIn","Twitter","YouTube"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <input type="text" placeholder="Objetivo" value={calAiForm.goal}
              onChange={(e) => setCalAiForm((f) => ({ ...f, goal: e.target.value }))}
              style={{ flex: 1, minWidth: "150px", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.9rem", color: "var(--text-active)", fontSize: "0.85rem", outline: "none" }} />
            <button className="btn-primary" onClick={handleGenerateCalendarAI}
              disabled={calAiLoading || !calAiForm.product.trim() || !calAiForm.goal.trim()}
              style={{ height: "38px", padding: "0 1.1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
              {calAiLoading ? "Generando..." : "Generar semana"}
            </button>
          </div>
          {calAiLoading && <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>Generando 7 días de contenido...</p>}
        </div>

        <div className="cal-wrap">
          <div className="cal-header">
            <span className="cal-title">{MONTHS[calMonth]} {calYear}</span>
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
              <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
              <button className="cal-add-btn" onClick={() => openModal()}>+ Nuevo evento</button>
            </div>
          </div>
          <div className="cal-days-header">
            {DAYS.map((d) => <div key={d} className="cal-day-label">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((cell, i) => {
              const key = cell.current ? toKey(calYear, calMonth, cell.day) : null;
              const isToday = cell.current && today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === cell.day;
              const dayEvents = key ? calEvents.filter((e) => e.date === key) : [];
              return (
                <div key={i} className={`cal-day${!cell.current ? " cal-other" : ""}${isToday ? " cal-today" : ""}`}
                  onClick={() => cell.current && openModal(key)}>
                  <div className="cal-day-num">{cell.day}</div>
                  {dayEvents.map((ev, j) => (
                    <div key={j} className={`cal-pill cal-pill-${ev.type}`}>{ev.title}</div>
                  ))}
                </div>
              );
            })}
          </div>
          {calModal && (
            <div className="cal-modal-overlay" onClick={() => setCalModal(false)}>
              <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cal-modal-title">Guardar evento</div>
                <div className="cal-field">
                  <label className="cal-label">Título</label>
                  <input type="text" placeholder="Ej: Post Instagram" value={calForm.title} onChange={(e) => setCalForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="cal-field">
                  <label className="cal-label">Fecha</label>
                  <input type="date" value={calForm.date} onChange={(e) => setCalForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="cal-field">
                  <label className="cal-label">Categoría</label>
                  <select value={calForm.type} onChange={(e) => setCalForm((f) => ({ ...f, type: e.target.value }))}>
                    <option value="purple">Campaña</option>
                    <option value="teal">Post orgánico</option>
                    <option value="coral">Hashtag / tendencia</option>
                  </select>
                </div>
                <div className="cal-modal-actions">
                  <button className="cal-btn-cancel" onClick={() => setCalModal(false)}>Cancelar</button>
                  <button className="cal-btn-save" onClick={saveEvent}>Guardar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── VIDEO STUDIO (chat) ── */
  const handleVideoStudioFileChange = (file) => {
    if (!file) return;
    setVideoStudioFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setVideoStudioFilePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleVideoStudioSend = async () => {
    if (!videoStudioInput.trim() && !videoStudioFile) return;
    const baseText = videoStudioInput.trim() || "Crea un script de video de marketing";
    const fileNote = videoStudioFile ? `\n\n[Imagen de referencia adjunta: "${videoStudioFile.name}" — úsala como inspiración visual para las escenas, paleta de colores y estética del video]` : "";
    const userText = baseText + fileNote;
    const newUserMsg = { role: "user", content: userText };
    const history = [...videoStudioMessages.map((m) => ({ role: m.role, content: m.rawContent || m.content })), newUserMsg];
    const pendingId = Date.now();
    const filePreviewSnapshot = videoStudioFilePreview;
    const fileNameSnapshot = videoStudioFile?.name;
    setVideoStudioMessages((prev) => [
      ...prev,
      { id: pendingId - 1, role: "user", content: baseText, rawContent: userText, filePreview: filePreviewSnapshot, fileName: fileNameSnapshot },
      { id: pendingId, role: "assistant", content: null, script: null, loading: true },
    ]);
    setVideoStudioInput("");
    setVideoStudioFile(null);
    setVideoStudioFilePreview(null);
    setVideoStudioLoading(true);
    setTimeout(() => videoStudioBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const data = await videoScriptChatAPI(history, videoStudioContext);
      setVideoStudioMessages((prev) => prev.map((m) =>
        m.id === pendingId
          ? { ...m, loading: false, script: data.type === "script" ? data.script : null, content: data.type === "text" ? data.text : null, rawContent: data.type === "script" ? JSON.stringify(data.script) : data.text }
          : m
      ));
    } catch (err) {
      setVideoStudioMessages((prev) => prev.map((m) =>
        m.id === pendingId ? { ...m, loading: false, content: "⚠️ " + (err.response?.data?.message || "Error al generar el script"), error: true } : m
      ));
    } finally {
      setVideoStudioLoading(false);
      setTimeout(() => videoStudioBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleDownloadVideoStudioScript = (script, idx) => {
    if (!script) return;
    const lines = [
      `SCRIPT DE VIDEO — ${videoStudioContext.product || "Marketing"}`,
      `Formato: ${videoStudioContext.format} | Duración: ${videoStudioContext.duration}`,
      "", `🎣 HOOK: ${script.hook}`, "",
      "🎬 ESCENAS:",
      ...(script.scenes || []).map((s, i) => `  Escena ${i + 1} (${s.time})\n  📷 ${s.visual}\n  🎤 ${s.narration}\n  ✂️ ${s.transition}`),
      "", `📝 CAPTION:\n${script.caption}`, "",
      `🚀 CTA: ${script.cta}`, "", `🎵 MÚSICA: ${script.musicTip}`, "",
      `💡 TIPS:\n${script.productionTips}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `video-script-${Date.now()}.txt`;
    a.click();
  };

  /* ── Adjuntar video a un script del Video Studio, disponible desde que se genera (no solo ya guardado en historial) ── */
  const attachVideoToStudioMessage = async (msgId, url) => {
    setVideoStudioMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, videoUrl: url } : m)));
    const target = videoStudioMessages.find((m) => m.id === msgId);
    if (target?.generationId) {
      try {
        await updateVideoUrlAPI(target.generationId, url);
      } catch {
        showToast("El video se adjuntó aquí, pero no se pudo guardar en el historial", "error");
      }
    }
  };

  const handleVideoAttachFileChange = async (msgId, file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showToast("El video supera 50MB. Usa un enlace de YouTube, Drive o Dropbox.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await attachVideoToStudioMessage(msgId, ev.target.result);
      showToast("Video adjuntado ✓", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveVideoStudioScript = async (msg) => {
    try {
      const data = await saveGenerationAPI(
        "video",
        { product: videoStudioContext.product, format: videoStudioContext.format, duration: videoStudioContext.duration, goal: videoStudioContext.goal, audience: videoStudioContext.audience },
        msg.script
      );
      const newId = String(data.generation._id);
      setVideoStudioMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, generationId: newId } : m)));
      if (msg.videoUrl) {
        await updateVideoUrlAPI(newId, msg.videoUrl);
      }
      showToast("Script guardado en el historial ✓", "success");
    } catch {
      showToast("No se pudo guardar", "error");
    }
  };

  const renderVideoStudio = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: 0 }}>
      {/* Header con contexto */}
      <div className="section-card" style={{ flexShrink: 0, marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <span className="section-title">🎬 Video Studio</span>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
              Describe el video que necesitas, pide cambios y la IA lo refina en tiempo real.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="Producto / servicio" value={videoStudioContext.product}
              onChange={(e) => setVideoStudioContext((c) => ({ ...c, product: e.target.value }))}
              style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.38rem 0.7rem", color: "var(--text-active)", fontSize: "0.8rem", outline: "none", width: "160px" }} />
            <select value={videoStudioContext.format} onChange={(e) => setVideoStudioContext((c) => ({ ...c, format: e.target.value }))}
              style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.38rem 0.7rem", color: "var(--text-active)", fontSize: "0.8rem", outline: "none" }}>
              {["Reel de Instagram", "TikTok", "YouTube Short", "Historia / Story", "YouTube largo", "LinkedIn Video"].map((f) => <option key={f}>{f}</option>)}
            </select>
            <select value={videoStudioContext.duration} onChange={(e) => setVideoStudioContext((c) => ({ ...c, duration: e.target.value }))}
              style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.38rem 0.7rem", color: "var(--text-active)", fontSize: "0.8rem", outline: "none" }}>
              {["15 segundos", "30 segundos", "60 segundos", "3 minutos", "5 minutos"].map((d) => <option key={d}>{d}</option>)}
            </select>
            {videoStudioMessages.length > 0 && (
              <button onClick={() => setVideoStudioMessages([])}
                style={{ background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.38rem 0.8rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem" }}>
                Nueva sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Input oculto compartido para adjuntar video a cualquier script de la conversación */}
      <input type="file" accept="video/*" ref={videoAttachFileRef} style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          const targetId = videoAttachTargetId;
          e.target.value = "";
          if (targetId != null) handleVideoAttachFileChange(targetId, file);
        }}
      />

      {/* Área de conversación */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem", padding: "0.5rem 0.25rem" }}>
        {videoStudioMessages.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "var(--text-muted)", textAlign: "center", padding: "3rem 1rem" }}>
            <div style={{ fontSize: "3.5rem" }}>🎬</div>
            <p style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-soft)", margin: 0 }}>¿Qué video necesitas crear hoy?</p>
            <p style={{ fontSize: "0.85rem", margin: 0, maxWidth: "380px", lineHeight: "1.6" }}>
              Describe el video, pide ajustes en cualquier momento y el equipo puede iterar hasta que quede perfecto.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem" }}>
              {[
                "Crea un Reel de 30s para lanzar un nuevo producto de skincare dirigido a mujeres de 25-35 años",
                "Genera un script para TikTok de 15 segundos muy energético para vender ropa deportiva",
                "Necesito un video de YouTube de 3 minutos para explicar los beneficios de un curso online de marketing",
              ].map((ex) => (
                <button key={ex} onClick={() => setVideoStudioInput(ex)}
                  style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "999px", padding: "0.4rem 0.9rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.75rem", textAlign: "left" }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {videoStudioMessages.map((msg, idx) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end" }}>
                  {msg.filePreview && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "0.4rem 0.6rem" }}>
                      <img src={msg.filePreview} alt="ref" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px" }} />
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.85)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.fileName}</span>
                    </div>
                  )}
                  <div style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", padding: "0.65rem 1rem", borderRadius: "18px 18px 4px 18px", color: "#fff", fontSize: "0.875rem", lineHeight: "1.5" }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🎬</div>
                <div style={{ flex: 1 }}>
                  {msg.loading && (
                    <div style={{ padding: "1rem 1.25rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "4px 18px 18px 18px", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div className="pulse-element" style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", flexShrink: 0 }} />
                      <span style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>Escribiendo el guion...</span>
                    </div>
                  )}
                  {!msg.loading && msg.content && (
                    <div style={{ padding: "0.75rem 1rem", background: msg.error ? "rgba(239,68,68,0.08)" : "var(--bg-secondary)", border: `1px solid ${msg.error ? "rgba(239,68,68,0.25)" : "var(--border-color)"}`, borderRadius: "4px 18px 18px 18px", color: msg.error ? "#fca5a5" : "var(--text-main)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                      {msg.content}
                    </div>
                  )}
                  {!msg.loading && msg.script && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {/* Hook */}
                      <div style={{ background: "rgba(201,105,43,0.07)", border: "1px solid rgba(201,105,43,0.35)", borderRadius: "4px 18px 18px 18px", padding: "0.9rem 1.1rem" }}>
                        <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--accent-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.35rem" }}>🎣 Hook</p>
                        <p style={{ color: "var(--text-active)", fontSize: "0.95rem", fontWeight: "700", lineHeight: "1.5", margin: 0 }}>"{msg.script.hook}"</p>
                      </div>
                      {/* Escenas */}
                      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "0.9rem 1.1rem" }}>
                        <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.6rem" }}>🎬 Escenas ({msg.script.scenes?.length})</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {(msg.script.scenes || []).map((s, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "0.5rem", padding: "0.6rem", background: "var(--bg-tertiary)", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-color)" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
                                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.7rem" }}>{i + 1}</div>
                                <span style={{ fontSize: "0.55rem", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>{s.time}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.18rem" }}>
                                <p style={{ fontSize: "0.76rem", color: "var(--text-soft)", margin: 0 }}>📷 {s.visual}</p>
                                <p style={{ fontSize: "0.76rem", color: "var(--text-main)", margin: 0 }}>🎤 {s.narration}</p>
                                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>✂️ {s.transition}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Caption + CTA + música */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                            <p style={{ fontSize: "0.63rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>📝 Caption</p>
                            <button onClick={() => { navigator.clipboard.writeText(msg.script.caption); showToast("Caption copiado ✓", "success"); }}
                              style={{ background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.3)", borderRadius: "var(--border-radius-sm)", padding: "0.12rem 0.4rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.63rem", fontWeight: "700" }}>
                              Copiar
                            </button>
                          </div>
                          <p style={{ fontSize: "0.76rem", color: "var(--text-main)", lineHeight: "1.55", margin: 0 }}>{msg.script.caption}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem", flex: 1 }}>
                            <p style={{ fontSize: "0.63rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.25rem" }}>🚀 CTA</p>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-active)", fontWeight: "700", margin: 0 }}>{msg.script.cta}</p>
                          </div>
                          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem", flex: 1 }}>
                            <p style={{ fontSize: "0.63rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.25rem" }}>🎵 Música</p>
                            <p style={{ fontSize: "0.76rem", color: "var(--text-soft)", margin: 0 }}>{msg.script.musicTip}</p>
                          </div>
                        </div>
                      </div>
                      {/* Tips + acciones */}
                      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem" }}>
                        <p style={{ fontSize: "0.63rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.4rem" }}>💡 Tips de producción</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          {(msg.script.productionTips || "").split(";").map((t, i) => t.trim() && (
                            <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start" }}>
                              <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(201,105,43,0.15)", color: "var(--accent-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.58rem", fontWeight: "800", flexShrink: 0, marginTop: "2px" }}>{i + 1}</span>
                              <p style={{ fontSize: "0.76rem", color: "var(--text-soft)", margin: 0, lineHeight: "1.5" }}>{t.trim()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button onClick={() => handleDownloadVideoStudioScript(msg.script, idx)}
                          style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.8rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Descargar
                        </button>
                        <button onClick={() => {
                          const full = [
                            `🎣 HOOK: ${msg.script.hook}`, "",
                            "🎬 ESCENAS:",
                            ...(msg.script.scenes || []).map((s, i) => `  Escena ${i+1} (${s.time})\n  📷 ${s.visual}\n  🎤 ${s.narration}\n  ✂️ ${s.transition}`),
                            "", `📝 CAPTION:\n${msg.script.caption}`, "",
                            `🚀 CTA: ${msg.script.cta}`, `🎵 MÚSICA: ${msg.script.musicTip}`, "",
                            `💡 TIPS: ${msg.script.productionTips}`,
                          ].join("\n");
                          navigator.clipboard.writeText(full);
                          showToast("Script copiado al portapapeles ✓", "success");
                        }}
                          style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.8rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.75rem" }}>
                          📋 Copiar todo
                        </button>
                        {msg.generationId ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.8rem", color: "#34d399", fontSize: "0.75rem", fontWeight: "700" }}>
                            ✓ Guardado en historial
                          </span>
                        ) : (
                          <button onClick={() => handleSaveVideoStudioScript(msg)}
                            style={{ background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.35)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.8rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" }}>
                            💾 Guardar en historial
                          </button>
                        )}
                        <button onClick={() => setVideoStudioInput("Refina este script y hazlo más impactante")}
                          style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.8rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.75rem" }}>
                          ✨ Refinar
                        </button>
                        <button onClick={() => setVideoStudioInput("Crea una variación diferente de este script")}
                          style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.8rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.75rem" }}>
                          🔄 Variar
                        </button>
                      </div>

                      {/* Adjuntar video a este script — disponible apenas se genera, sin esperar a guardarlo en historial */}
                      <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                          <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                            🎞️ Video de esta campaña
                          </p>
                          {msg.videoUrl && (
                            <button onClick={() => attachVideoToStudioMessage(msg.id, null)}
                              style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--border-radius-sm)", padding: "0.2rem 0.6rem", color: "#f87171", cursor: "pointer", fontSize: "0.7rem" }}>
                              Quitar video
                            </button>
                          )}
                        </div>

                        {msg.videoUrl && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            {msg.videoUrl.includes("youtube.com") || msg.videoUrl.includes("youtu.be") ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${msg.videoUrl.split("v=")[1]?.split("&")[0] || msg.videoUrl.split("/").pop()}`}
                                style={{ width: "100%", height: "240px", borderRadius: "var(--border-radius-md)", border: "none" }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : msg.videoUrl.startsWith("data:video") || /\.(mp4|webm|mov|ogg)$/i.test(msg.videoUrl) ? (
                              <video controls style={{ width: "100%", borderRadius: "var(--border-radius-md)", maxHeight: "260px", background: "#000" }}>
                                <source src={msg.videoUrl} />
                              </video>
                            ) : (
                              <a href={msg.videoUrl} target="_blank" rel="noopener noreferrer"
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", color: "var(--accent-secondary)", fontSize: "0.8rem", textDecoration: "none", fontWeight: "600" }}>
                                Ver video adjunto →
                              </a>
                            )}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <button onClick={() => { setVideoAttachTargetId(msg.id); videoAttachFileRef.current?.click(); }}
                            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(201,105,43,0.12)", border: "1.5px solid var(--accent-secondary)", borderRadius: "var(--border-radius-sm)", padding: "0.4rem 0.75rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", flexShrink: 0 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Subir video
                          </button>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", flexShrink: 0 }}>o pega un enlace</span>
                          <input
                            value={videoAttachLinkInputs[msg.id] || ""}
                            onChange={(e) => setVideoAttachLinkInputs((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                            onKeyDown={async (e) => {
                              if (e.key !== "Enter" || !videoAttachLinkInputs[msg.id]?.trim()) return;
                              const url = videoAttachLinkInputs[msg.id].trim();
                              setVideoAttachLinkInputs((prev) => ({ ...prev, [msg.id]: "" }));
                              await attachVideoToStudioMessage(msg.id, url);
                              showToast("Enlace guardado ✓", "success");
                            }}
                            placeholder="YouTube, Drive, Dropbox… (Enter para guardar)"
                            style={{ flex: 1, minWidth: "180px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.4rem 0.7rem", color: "var(--text-active)", fontSize: "0.78rem", outline: "none" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={videoStudioBottomRef} />
      </div>

      {/* Input inferior */}
      <div style={{ flexShrink: 0, paddingTop: "0.75rem" }}>
        {/* Preview archivo adjunto */}
        {videoStudioFilePreview && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", padding: "0.5rem 0.75rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)" }}>
            <img src={videoStudioFilePreview} alt="referencia" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", margin: 0, fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{videoStudioFile?.name}</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>Imagen de referencia visual para el script</p>
            </div>
            <button onClick={() => { setVideoStudioFile(null); setVideoStudioFilePreview(null); }}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: "0.2rem" }}>✕</button>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", padding: "0.6rem 0.75rem" }}>
          {/* Input oculto de archivo */}
          <input type="file" accept="image/*,video/*" ref={videoStudioFileRef} style={{ display: "none" }} onChange={(e) => handleVideoStudioFileChange(e.target.files[0])} />

          {/* Botón adjuntar */}
          <button onClick={() => videoStudioFileRef.current?.click()} title="Adjuntar imagen o referencia visual"
            style={{ background: videoStudioFile ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" : "rgba(201,105,43,0.15)", border: "1.5px solid var(--accent-secondary)", color: videoStudioFile ? "#fff" : "var(--accent-secondary)", cursor: "pointer", padding: "0.42rem", borderRadius: "8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: "0 0 8px rgba(201,105,43,0.25)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>

          <textarea
            value={videoStudioInput}
            onChange={(e) => setVideoStudioInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!videoStudioLoading) handleVideoStudioSend(); } }}
            placeholder='Describe el video, adjunta una imagen de referencia, o pide cambios: "hazlo más energético", "cambia la escena 2"…'
            rows={1}
            style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: "var(--text-active)", fontSize: "0.9rem", lineHeight: "1.5", maxHeight: "120px", overflowY: "auto", paddingTop: "0.25rem" }}
          />

          {/* Botón enviar — prominente */}
          <button
            onClick={handleVideoStudioSend}
            disabled={videoStudioLoading || (!videoStudioInput.trim() && !videoStudioFile)}
            style={{
              background: videoStudioLoading || (!videoStudioInput.trim() && !videoStudioFile)
                ? "var(--bg-tertiary)"
                : "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              border: "none",
              borderRadius: "999px",
              padding: "0.52rem 1.1rem",
              cursor: videoStudioLoading || (!videoStudioInput.trim() && !videoStudioFile) ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0,
              boxShadow: videoStudioLoading || (!videoStudioInput.trim() && !videoStudioFile)
                ? "none"
                : "0 0 16px rgba(201,105,43,0.45)",
              transition: "box-shadow 0.2s, background 0.2s",
            }}>
            {videoStudioLoading ? (
              <>
                <div className="pulse-element" style={{ width: "14px", height: "14px", borderRadius: "50%", background: "var(--accent-secondary)" }} />
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Generando…</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <span style={{ fontSize: "0.8rem", color: "#fff", fontWeight: "700" }}>Generar</span>
              </>
            )}
          </button>
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.4rem" }}>
          Enter para enviar · Shift+Enter para nueva línea · Adjunta imágenes de referencia con el clip
        </p>
      </div>
    </div>
  );

  /* ── ESTUDIO DE IMAGEN ── */
  const handleStudioFileChange = (file) => {
    if (!file) return;
    setStudioFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setStudioFilePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleStudioSend = async () => {
    if (!studioPrompt.trim() && !studioFile) return;
    const prompt = studioPrompt.trim() || "Genera una imagen de marketing profesional";
    setStudioLoading(true);
    const pendingMsg = { id: Date.now(), prompt, referencePreview: studioFilePreview, result: null, error: null };
    setStudioMessages((prev) => [...prev, pendingMsg]);
    setStudioPrompt("");
    setStudioFile(null);
    setStudioFilePreview(null);
    setTimeout(() => studioBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const data = await generateImageOpenAIAPI(prompt, studioFile, studioSize);
      const dataUrl = `data:${data.mimeType};base64,${data.b64}`;
      setStudioMessages((prev) => prev.map((m) => m.id === pendingMsg.id ? { ...m, result: dataUrl } : m));
    } catch (err) {
      const msg = err.response?.data?.message || "Error al generar la imagen";
      setStudioMessages((prev) => prev.map((m) => m.id === pendingMsg.id ? { ...m, error: msg } : m));
    } finally {
      setStudioLoading(false);
      setTimeout(() => studioBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleStudioDownload = (dataUrl, idx) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `imagen-marketing-${idx + 1}-${Date.now()}.png`;
    a.click();
  };

  const renderImageStudio = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: 0 }}>
      {/* Header */}
      <div className="section-card" style={{ flexShrink: 0, marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <span className="section-title">🎨 Estudio de Imagen</span>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
              Describe la imagen que necesitas, adjunta tu logo o una imagen de referencia, y la IA la crea para ti.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <label style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Tamaño</label>
            <select value={studioSize} onChange={(e) => setStudioSize(e.target.value)}
              style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.4rem 0.7rem", color: "var(--text-active)", fontSize: "0.8rem", outline: "none" }}>
              <option value="1024x1024">1:1 Cuadrado</option>
              <option value="1792x1024">16:9 Horizontal</option>
              <option value="1024x1792">9:16 Vertical / Story</option>
            </select>
            {studioMessages.length > 0 && (
              <button onClick={() => setStudioMessages([])}
                style={{ background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.4rem 0.8rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem" }}>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Área de conversación */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem", padding: "0.5rem 0.25rem" }}>
        {studioMessages.length === 0 && !studioLoading && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "var(--text-muted)", textAlign: "center", padding: "3rem 1rem" }}>
            <div style={{ fontSize: "3.5rem" }}>🎨</div>
            <p style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-soft)", margin: 0 }}>¿Qué imagen necesitas hoy?</p>
            <p style={{ fontSize: "0.85rem", margin: 0, maxWidth: "360px", lineHeight: "1.6" }}>
              Describe la imagen, adjunta tu logo o una foto de referencia para que la IA mantenga el estilo o lo incorpore.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem" }}>
              {["Foto de producto sobre fondo blanco con sombra sutil", "Banner para redes sociales con colores vibrantes", "Imagen de campaña con logo de referencia adjunto"].map((ex) => (
                <button key={ex} onClick={() => setStudioPrompt(ex)}
                  style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "999px", padding: "0.4rem 0.9rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.75rem" }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {studioMessages.map((msg, idx) => (
          <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {/* Prompt del usuario */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                {msg.referencePreview && (
                  <img src={msg.referencePreview} alt="referencia" style={{ maxWidth: "160px", maxHeight: "120px", borderRadius: "var(--border-radius-md)", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                )}
                <div style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", padding: "0.65rem 1rem", borderRadius: "18px 18px 4px 18px", color: "#fff", fontSize: "0.875rem", lineHeight: "1.5" }}>
                  {msg.prompt}
                </div>
              </div>
            </div>

            {/* Resultado de la IA */}
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🎨</div>
              <div style={{ flex: 1 }}>
                {!msg.result && !msg.error && (
                  <div style={{ padding: "1rem", background: "var(--bg-secondary)", borderRadius: "4px 18px 18px 18px", border: "1px solid var(--border-color)" }}>
                    <div className="pulse-element" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }} />
                  </div>
                )}
                {msg.error && (
                  <div style={{ padding: "0.75rem 1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "4px 18px 18px 18px", color: "#fca5a5", fontSize: "0.85rem" }}>
                    ⚠️ {msg.error}
                  </div>
                )}
                {msg.result && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <img src={msg.result} alt={`Imagen ${idx + 1}`}
                      style={{ maxWidth: "480px", width: "100%", borderRadius: "var(--border-radius-md)", display: "block", border: "1px solid var(--border-color)" }} />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleStudioDownload(msg.result, idx)}
                        style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.8rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Descargar
                      </button>
                      <button onClick={() => setStudioPrompt(`Varía esta imagen: ${msg.prompt}`)}
                        style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.8rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.75rem" }}>
                        🔄 Variar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={studioBottomRef} />
      </div>

      {/* Input inferior tipo ChatGPT */}
      <div style={{ flexShrink: 0, paddingTop: "0.75rem" }}>
        {studioFilePreview && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", padding: "0.5rem 0.75rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)" }}>
            <img src={studioFilePreview} alt="adjunto" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-soft)", flex: 1 }}>{studioFile?.name}</span>
            <button onClick={() => { setStudioFile(null); setStudioFilePreview(null); }}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>✕</button>
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", padding: "0.6rem 0.75rem" }}>
          <input type="file" accept="image/*" ref={studioFileRef} style={{ display: "none" }} onChange={(e) => handleStudioFileChange(e.target.files[0])} />
          <button onClick={() => studioFileRef.current?.click()} title="Adjuntar imagen o logo"
            style={{ background: studioFile ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" : "rgba(201,105,43,0.15)", border: "1.5px solid var(--accent-secondary)", color: studioFile ? "#fff" : "var(--accent-secondary)", cursor: "pointer", padding: "0.42rem", borderRadius: "8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: "0 0 8px rgba(201,105,43,0.25)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <textarea
            value={studioPrompt}
            onChange={(e) => setStudioPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!studioLoading) handleStudioSend(); } }}
            placeholder="Describe la imagen… o adjunta tu logo y di cómo usarlo"
            rows={1}
            style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: "var(--text-active)", fontSize: "0.9rem", lineHeight: "1.5", maxHeight: "120px", overflowY: "auto", paddingTop: "0.25rem" }}
          />
          <button onClick={handleStudioSend} disabled={studioLoading || (!studioPrompt.trim() && !studioFile)}
            style={{ background: studioLoading || (!studioPrompt.trim() && !studioFile) ? "var(--bg-tertiary)" : "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", border: "none", borderRadius: "8px", padding: "0.5rem 0.65rem", cursor: studioLoading || (!studioPrompt.trim() && !studioFile) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {studioLoading
              ? <div className="pulse-element" style={{ width: "18px", height: "18px", borderRadius: "50%", background: "var(--accent-secondary)" }} />
              : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            }
          </button>
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.4rem" }}>
          Enter para enviar · Shift+Enter para nueva línea · 📎 adjunta logo o imagen de referencia
        </p>
      </div>
    </div>
  );

  /* ── VIDEO SCRIPT ── */
  const handleGenerateVideo = async () => {
    if (!videoForm.product.trim() || !videoForm.goal.trim() || !videoForm.audience.trim()) return;
    setVideoLoading(true);
    setVideoResult(null);
    setVideoGenerationId(null);
    try {
      const data = await generateVideoScriptAPI(videoForm);
      setVideoResult(data.script);
      setVideoGenerationId(data.generationId);
      showToast("Script de video generado ✓", "success");
      await loadHistory();
    } catch (err) {
      showToast("Error al generar el script de video", "error");
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDownloadVideoScript = () => {
    if (!videoResult) return;
    const lines = [
      `SCRIPT DE VIDEO — ${videoForm.product}`,
      `Formato: ${videoForm.format} | Duración: ${videoForm.duration}`,
      `Objetivo: ${videoForm.goal} | Público: ${videoForm.audience}`,
      "",
      `🎣 HOOK: ${videoResult.hook}`,
      "",
      "🎬 ESCENAS:",
      ...(videoResult.scenes || []).map((s, i) =>
        `  Escena ${i + 1} (${s.time})\n  📷 Visual: ${s.visual}\n  🎤 Narración: ${s.narration}\n  ✂️ Transición: ${s.transition}`
      ),
      "",
      `📝 CAPTION:\n${videoResult.caption}`,
      "",
      `🚀 CTA: ${videoResult.cta}`,
      "",
      `🎵 MÚSICA: ${videoResult.musicTip}`,
      "",
      `💡 TIPS DE PRODUCCIÓN:\n${videoResult.productionTips}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-script-${videoForm.product}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pollRealVideo = (taskId) => {
    realVideoPollRef.current = setInterval(async () => {
      try {
        const data = await getRealVideoStatusAPI(taskId);
        if (data.status === "SUCCEEDED") {
          clearInterval(realVideoPollRef.current);
          setRealVideoUrl(data.videoUrl);
          setRealVideoStatus("done");
          showToast("¡Video generado! 🎬", "success");
        } else if (data.status === "FAILED") {
          clearInterval(realVideoPollRef.current);
          setRealVideoStatus("error");
          setRealVideoError(data.failure || "La generación del video falló en Runway");
        }
      } catch (err) {
        clearInterval(realVideoPollRef.current);
        setRealVideoStatus("error");
        setRealVideoError(err.response?.data?.message || "Error al consultar el estado del video");
      }
    }, 5000);
  };

  const handleGenerateRealVideo = async () => {
    if (!videoForm.product.trim()) return;
    if (realVideoPollRef.current) clearInterval(realVideoPollRef.current);
    setRealVideoStatus("starting");
    setRealVideoUrl(null);
    setRealVideoError("");
    try {
      const prompt = `${videoForm.product}${videoForm.goal ? `, ${videoForm.goal}` : ""}, cinematic professional marketing video`;
      const data = await generateRealVideoAPI({ product: videoForm.product, prompt, duration: realVideoDuration });
      setRealVideoStatus("processing");
      pollRealVideo(data.taskId);
    } catch (err) {
      setRealVideoStatus("error");
      setRealVideoError(err.response?.data?.message || "Error al iniciar la generación del video");
    }
  };

  useEffect(() => () => { if (realVideoPollRef.current) clearInterval(realVideoPollRef.current); }, []);

  const renderVideo = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-title">🎬 Generador de Script de Video</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          La IA crea un guion escena por escena listo para grabar — Reels, TikToks, YouTube Shorts y más.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>Producto / Servicio</label>
            <input type="text" placeholder="Ej: café artesanal, curso online, ropa deportiva..." value={videoForm.product}
              onChange={(e) => setVideoForm((f) => ({ ...f, product: e.target.value }))}
              style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.65rem 0.9rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>Formato</label>
            <select value={videoForm.format} onChange={(e) => setVideoForm((f) => ({ ...f, format: e.target.value }))}
              style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.65rem 0.9rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none" }}>
              {["Reel de Instagram", "TikTok", "YouTube Short", "Historia / Story", "YouTube largo", "LinkedIn Video"].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>Duración</label>
            <select value={videoForm.duration} onChange={(e) => setVideoForm((f) => ({ ...f, duration: e.target.value }))}
              style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.65rem 0.9rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none" }}>
              {["15 segundos", "30 segundos", "60 segundos", "3 minutos", "5 minutos"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>Objetivo del video</label>
            <input type="text" placeholder="Ej: aumentar ventas, generar awareness..." value={videoForm.goal}
              onChange={(e) => setVideoForm((f) => ({ ...f, goal: e.target.value }))}
              style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.65rem 0.9rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>Público objetivo</label>
            <input type="text" placeholder="Ej: mujeres 25-35, emprendedores..." value={videoForm.audience}
              onChange={(e) => setVideoForm((f) => ({ ...f, audience: e.target.value }))}
              style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.65rem 0.9rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <button className="btn-primary" onClick={handleGenerateVideo}
          disabled={videoLoading || !videoForm.product.trim() || !videoForm.goal.trim() || !videoForm.audience.trim()}
          style={{ marginTop: "1rem", height: "44px", fontSize: "0.9rem", width: "100%" }}>
          {videoLoading ? "Creando script con IA..." : "🎬 Generar Script de Video"}
        </button>
      </div>

      {/* Video real con IA (Runway) */}
      <div className="section-card" style={{ border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.04)" }}>
        <div className="section-card-header">
          <span className="section-title">🎥 Generar Video Real con IA</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Genera un clip de video real (no solo texto) a partir del producto descrito arriba. Por limitaciones de los modelos actuales de IA, el clip dura {realVideoDuration} segundos.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>Duración del clip</label>
            <select value={realVideoDuration} onChange={(e) => setRealVideoDuration(Number(e.target.value))}
              style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.65rem 0.9rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none" }}>
              <option value={5}>5 segundos</option>
              <option value={10}>10 segundos</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleGenerateRealVideo}
            disabled={realVideoStatus === "starting" || realVideoStatus === "processing" || !videoForm.product.trim()}
            style={{ height: "44px", fontSize: "0.9rem", padding: "0 1.5rem" }}>
            {realVideoStatus === "starting" ? "Iniciando..." : realVideoStatus === "processing" ? "Generando video..." : "🎥 Generar Video Real"}
          </button>
        </div>
        {!videoForm.product.trim() && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.6rem" }}>Escribe el producto/servicio arriba para poder generar el video.</p>
        )}

        {realVideoStatus === "processing" && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "1rem" }}>
            <div className="pulse-element" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", margin: "0 auto 1rem" }} />
            Generando el clip de video con IA... esto puede tardar 1-3 minutos.
          </div>
        )}

        {realVideoStatus === "error" && (
          <div style={{ marginTop: "1rem", padding: "0.9rem 1.1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--border-radius-sm)", color: "#fca5a5", fontSize: "0.83rem" }}>
            ⚠️ {realVideoError}
          </div>
        )}

        {realVideoStatus === "done" && realVideoUrl && (
          <div style={{ marginTop: "1.25rem" }}>
            <video src={realVideoUrl} controls style={{ width: "100%", borderRadius: "var(--border-radius-md)", display: "block" }} />
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.75rem" }}>
              <a href={realVideoUrl} download={`video-${videoForm.product}-${Date.now()}.mp4`} target="_blank" rel="noreferrer"
                className="btn-primary" style={{ padding: "0.55rem 1.4rem", fontSize: "0.85rem", height: "auto", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                ↓ Descargar video
              </a>
            </div>
          </div>
        )}
      </div>

      {videoLoading && (
        <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <div className="pulse-element" style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", margin: "0 auto 1rem" }} />
          Escribiendo el guion escena por escena...
        </div>
      )}

      {videoResult && !videoLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Hook */}
          <div className="section-card" style={{ border: "1px solid rgba(201,105,43,0.35)", background: "rgba(201,105,43,0.06)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--accent-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>🎣 Hook — primeros 3 segundos</p>
            <p style={{ color: "var(--text-active)", fontSize: "1.05rem", fontWeight: "700", lineHeight: "1.5", margin: 0 }}>"{videoResult.hook}"</p>
          </div>

          {/* Escenas */}
          <div className="section-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>🎬 Escenas ({videoResult.scenes?.length})</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(videoResult.scenes || []).map((scene, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: "0.75rem", padding: "0.9rem", background: "var(--bg-tertiary)", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.8rem", flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>{scene.time}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", margin: 0 }}><span style={{ color: "var(--text-muted)", fontWeight: "700" }}>📷 </span>{scene.visual}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-main)", margin: 0 }}><span style={{ color: "var(--text-muted)", fontWeight: "700" }}>🎤 </span>{scene.narration}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}><span style={{ fontWeight: "700", fontStyle: "normal" }}>✂️ </span>{scene.transition}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caption + CTA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="section-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>📝 Caption listo</p>
                <button onClick={() => { navigator.clipboard.writeText(videoResult.caption); showToast("Caption copiado ✓", "success"); }}
                  style={{ background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.3)", borderRadius: "var(--border-radius-sm)", padding: "0.25rem 0.65rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.72rem", fontWeight: "700" }}>
                  Copiar
                </button>
              </div>
              <p style={{ fontSize: "0.83rem", color: "var(--text-main)", lineHeight: "1.65", margin: 0 }}>{videoResult.caption}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="section-card" style={{ flex: 1 }}>
                <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>🚀 CTA Final</p>
                <p style={{ fontSize: "0.875rem", color: "var(--text-active)", fontWeight: "700", margin: 0 }}>{videoResult.cta}</p>
              </div>
              <div className="section-card" style={{ flex: 1 }}>
                <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>🎵 Música recomendada</p>
                <p style={{ fontSize: "0.83rem", color: "var(--text-soft)", margin: 0 }}>{videoResult.musicTip}</p>
              </div>
            </div>
          </div>

          {/* Tips de producción */}
          <div className="section-card">
            <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>💡 Tips de producción</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {(videoResult.productionTips || "").split(";").map((tip, i) => tip.trim() && (
                <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(201,105,43,0.15)", color: "var(--accent-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "800", flexShrink: 0, marginTop: "1px" }}>{i + 1}</span>
                  <p style={{ fontSize: "0.83rem", color: "var(--text-soft)", margin: 0, lineHeight: "1.5" }}>{tip.trim()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button onClick={handleGenerateVideo}
              style={{ background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.55rem 1.2rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem" }}>
              Regenerar script
            </button>
            <button className="btn-primary" onClick={handleDownloadVideoScript} style={{ padding: "0.55rem 1.4rem", fontSize: "0.85rem", height: "auto" }}>
              ↓ Descargar script
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* ── TENDENCIAS ── */
  const handleGenerateTrends = async () => {
    if (!trendsTopic.trim()) return;
    setTrendsLoading(true);
    try {
      const data = await generateTrendsAPI(trendsTopic.trim());
      setTrends(data.trends.map((t, i) => ({ ...t, id: `ai-${Date.now()}-${i}` })));
      showToast("Tendencias generadas con IA ✓", "success");
    } catch (err) { showToast("Error al generar tendencias", "error"); }
    finally { setTrendsLoading(false); }
  };
  const handleAddManualTrend = () => {
    if (!manualForm.title.trim() || !manualForm.description.trim()) return;
    setTrends((prev) => [...prev, { ...manualForm, id: `manual-${Date.now()}` }]);
    setManualForm({ title: "", description: "", color: "#f5b27a" });
    setManualModal(false);
  };
  const deleteTrend = (id) => setTrends((prev) => prev.filter((t) => t.id !== id));

  const renderTrends = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-title">Tendencias de Marketing Digital</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Genera tendencias personalizadas con IA para tu nicho o agrégalas manualmente.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="Ej: ropa deportiva, software B2B, restaurantes..." value={trendsTopic}
            onChange={(e) => setTrendsTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateTrends()}
            style={{ flex: 1, minWidth: "220px", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.7rem 1rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none" }} />
          <button className="btn-primary" onClick={handleGenerateTrends} disabled={trendsLoading || !trendsTopic.trim()} style={{ height: "42px", padding: "0 1.2rem", whiteSpace: "nowrap" }}>
            {trendsLoading ? "Generando..." : "Generar con IA"}
          </button>
          <button onClick={() => setManualModal(true)}
            style={{ height: "42px", padding: "0 1.2rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
            + Agregar manual
          </button>
        </div>
      </div>

      {trendsLoading && (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Analizando tendencias para <strong style={{ color: "var(--text-active)" }}>{trendsTopic}</strong>...
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {trends.map((trend) => (
          <div key={trend.id} className="trend-card">
            <button onClick={() => deleteTrend(trend.id)} title="Eliminar"
              style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
            <h4 style={{ color: trend.color, marginBottom: "0.75rem", paddingRight: "1.5rem", fontSize: "0.95rem" }}>{trend.title}</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6" }}>{trend.description}</p>
          </div>
        ))}
      </div>

      {manualModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setManualModal(false)}>
          <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", padding: "2rem", width: "100%", maxWidth: "460px" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "var(--text-active)", marginBottom: "1.5rem", fontWeight: "700" }}>Agregar tendencia</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.4rem" }}>Título</label>
                <input type="text" placeholder="Título de la tendencia" value={manualForm.title}
                  onChange={(e) => setManualForm((f) => ({ ...f, title: e.target.value }))}
                  style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.7rem 1rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.4rem" }}>Descripción</label>
                <textarea placeholder="Describe la tendencia..." value={manualForm.description}
                  onChange={(e) => setManualForm((f) => ({ ...f, description: e.target.value }))} rows={3}
                  style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.7rem 1rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.5rem" }}>Color</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["#a5b4fc","#38bdf8","#34d399","#fb923c","#f472b6","#facc15"].map((c) => (
                    <div key={c} onClick={() => setManualForm((f) => ({ ...f, color: c }))}
                      style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: c, cursor: "pointer", border: manualForm.color === c ? "3px solid #fff" : "3px solid transparent" }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => setManualModal(false)}
                style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.875rem" }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAddManualTrend} style={{ padding: "0.6rem 1.4rem" }}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── HISTORIAL ── */
  const renderHistory = () => {
    const FILTERS = [
      { id: "all", label: "Todos" }, { id: "favorites", label: "⭐ Favoritos" },
      { id: "campaign", label: "Campañas" }, { id: "copy", label: "Copys" },
      { id: "hashtag", label: "Hashtags" }, { id: "calendar", label: "Calendarios" },
      { id: "video", label: "🎬 Videos" },
    ];
    const filtered = history.filter((item) => {
      const matchesFilter = historyFilter === "all" ? true : historyFilter === "favorites" ? item.isFavorite : item.type === historyFilter;
      const q = historySearch.toLowerCase();
      const matchesSearch = !q || (item.input?.product || "").toLowerCase().includes(q) || (typeof item.output === "string" && item.output.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
    const filterBtnStyle = (id) => ({
      padding: "0.35rem 0.9rem", borderRadius: "50px", border: "1px solid", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
      borderColor: historyFilter === id ? "var(--accent-primary)" : "var(--border-color)",
      backgroundColor: historyFilter === id ? "rgba(201,105,43,0.12)" : "transparent",
      color: historyFilter === id ? "var(--accent-secondary)" : "var(--text-muted)",
    });

    return (
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-title">Historial de Creaciones</span>
          {history.length > 0 && (
            <button className="btn-primary" style={{ backgroundColor: "#ef4444", backgroundImage: "none", height: "34px", padding: "0 1rem", fontSize: "0.8rem" }} onClick={clearHistory}>
              Limpiar todo
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Buscar por producto o contenido..."
              autoComplete="off"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              style={{ width: "100%", paddingLeft: "2.2rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.55rem 0.9rem 0.55rem 2.2rem", color: "var(--text-main)", fontSize: "0.85rem", outline: "none" }}
            />
          </div>
          {historySearch && (
            <button onClick={() => setHistorySearch("")} style={{ fontSize: "0.78rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
              Limpiar ✕
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {FILTERS.map((f) => (<button key={f.id} style={filterBtnStyle(f.id)} onClick={() => setHistoryFilter(f.id)}>{f.label}</button>))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
            {historyFilter === "favorites" ? "No tienes favoritos guardados." : "No hay elementos en esta categoría."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filtered.map((item) => (
              <div key={item._id} className="history-card" style={{ border: `1px solid ${item.isFavorite ? "rgba(250,204,21,0.3)" : "rgba(255,255,255,0.1)"}`, padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", gap: "0.45rem", alignItems: "center", justifyContent: "flex-end", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                  {(item.type === "campaign" || item.type === "copy" || item.type === "hashtag") && (
                    <button onClick={() => { setRefineModal(item); setRefineResult(""); }} title="Perfeccionar con IA" className="btn-action-refine">
                      ✨ Perfeccionar
                    </button>
                  )}
                  {(item.type === "campaign" || item.type === "copy" || item.type === "hashtag") && (
                    <button
                      onClick={() => setPublishModalOpen({ content: item.output, imageUrl: item.imageUrl || null })}
                      title="Publicar en redes sociales"
                      style={{ height: "30px", padding: "0 0.75rem", fontSize: "0.75rem", background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.4)", borderRadius: "var(--border-radius-sm)", color: "var(--accent-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: "700" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                      Publicar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const text = Array.isArray(item.output) ? item.output.join("\n") : typeof item.output === "object" ? JSON.stringify(item.output, null, 2) : item.output;
                      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `${item.type}-${item.input?.product || "resultado"}-${Date.now()}.txt`; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Descargar como .txt"
                    className="btn-action-download">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    .txt
                  </button>
                  <button onClick={() => toggleFavorite(item._id)} title={item.isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"} className={item.isFavorite ? "btn-action-fav active" : "btn-action-fav"}>
                    {item.isFavorite ? "★" : "☆"} Fav
                  </button>
                  <button onClick={() => deleteHistoryItem(item._id)} title="Eliminar" className="btn-action-delete">✕</button>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "0.7rem" }}>
                  <span style={{ fontSize: "0.75rem", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", color: "#fff", padding: "0.25rem 0.7rem", borderRadius: "5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", boxShadow: "0 2px 8px rgba(201,105,43,0.3)" }}>
                    {TYPE_LABELS[item.type] || item.type}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <h4 style={{ color: "var(--text-active)", fontSize: "1rem", marginBottom: "0.1rem", fontWeight: "700", letterSpacing: "-0.02em", borderLeft: "3px solid var(--accent-primary)", paddingLeft: "0.6rem" }}>
                  {item.input?.product || "Sin nombre"}
                </h4>
                {item.output && (() => {
                  const raw = Array.isArray(item.output) ? item.output.join(" ") : typeof item.output === "object" ? JSON.stringify(item.output) : item.output;
                  const preview = raw?.slice(0, 130);
                  return preview ? (
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.55", marginTop: "0.4rem", marginBottom: 0, paddingLeft: "0.6rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {preview}{raw.length > 130 ? "…" : ""}
                    </p>
                  ) : null;
                })()}
                <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <button className="btn-view-detail" onClick={() => openDetailModal(item)}>
                    Ver completo
                    <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                    </svg>
                  </button>
                  {item.type === "campaign" && (
                    <button
                      onClick={() => openDetailModal(item)}
                      title={item.imageUrl ? "Ver / cambiar imagen" : "Generar imagen para esta campaña"}
                      style={{ height: "28px", padding: "0 0.75rem", fontSize: "0.74rem", background: item.imageUrl ? "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(2,132,199,0.15))" : "rgba(201,105,43,0.1)", border: `1px solid ${item.imageUrl ? "rgba(14,165,233,0.4)" : "rgba(201,105,43,0.35)"}`, borderRadius: "999px", color: item.imageUrl ? "#38bdf8" : "var(--accent-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: "700" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      {item.imageUrl ? "Con imagen" : "🎨 Generar imagen"}
                    </button>
                  )}
                  {(item.type === "campaign" || item.type === "copy" || item.type === "hashtag") && (
                    <button
                      onClick={() => openDetailModal(item)}
                      title="Generar video script para este contenido"
                      style={{ height: "28px", padding: "0 0.75rem", fontSize: "0.74rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: "999px", color: "#a78bfa", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: "700" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                      🎬 Video Script
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {detailModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={closeDetailModal}>
          <div
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", width: "92vw", maxWidth: "1060px", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: "1.5rem 1.75rem 1rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexShrink: 0 }}>
              <div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.68rem", background: "rgba(201,105,43,0.15)", color: "#f5b27a", padding: "0.18rem 0.55rem", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {TYPE_LABELS[detailModal.type] || detailModal.type}
                  </span>
                  {detailModal.isFavorite && <span style={{ fontSize: "0.85rem" }}>⭐</span>}
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{new Date(detailModal.createdAt).toLocaleString()}</span>
                </div>
                <h3 style={{ color: "var(--text-active)", fontWeight: "700", fontSize: "1.05rem", margin: 0 }}>
                  {detailModal.input?.product || "Sin nombre"}
                </h3>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                {!detailEditMode ? (
                  <button
                    onClick={() => { setDetailEditContent(outputToString(detailModal.output)); setDetailEditMode(true); }}
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.35)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.75rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </button>
                ) : (
                  <>
                    <button onClick={handleSaveEdit} disabled={detailSaving}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", border: "none", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.75rem", color: "#fff", cursor: detailSaving ? "default" : "pointer", fontSize: "0.78rem", fontWeight: "700" }}>
                      {detailSaving ? "Guardando…" : "✓ Guardar"}
                    </button>
                    <button onClick={() => setDetailEditMode(false)}
                      style={{ background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.35rem 0.6rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem" }}>
                      Cancelar
                    </button>
                  </>
                )}
                <button onClick={closeDetailModal} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1 }}>✕</button>
              </div>
            </div>

            {/* Contenido scrollable */}
            <div style={{ overflowY: "auto", flex: 1, padding: "1.5rem 1.75rem" }}>
              {detailEditMode ? (
                <textarea
                  value={detailEditContent}
                  onChange={(e) => setDetailEditContent(e.target.value)}
                  style={{ width: "100%", minHeight: "260px", background: "rgba(11,15,25,0.6)", border: "1.5px solid var(--accent-secondary)", borderRadius: "var(--border-radius-sm)", padding: "1.25rem", fontSize: "0.93rem", color: "var(--text-active)", lineHeight: "1.8", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              ) : (
                <div style={{ background: "rgba(11,15,25,0.5)", border: "1px solid var(--border-color)", borderLeft: "3px solid var(--accent-primary)", borderRadius: "var(--border-radius-sm)", padding: "1.75rem", fontSize: "0.95rem", color: "var(--text-main)", lineHeight: "1.85", whiteSpace: "pre-wrap" }}>
                  {outputToString(detailModal.output)}
                </div>
              )}

              {/* Imagen — generación y edición para campañas */}
              {detailModal.type === "campaign" && (
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                      🎨 {detailImageUrl ? "Imagen de la campaña" : "Generar imagen para la campaña"}
                    </p>
                    {detailImageUrl && !detailImageLoading && !detailImageError && (
                      <button onClick={handleDownloadDetailImage}
                        style={{ height: "30px", padding: "0 0.75rem", fontSize: "0.75rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", color: "var(--text-soft)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Descargar
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.85rem" }}>
                    <input
                      type="text"
                      placeholder="Describe la imagen o déjalo vacío para generarla automáticamente"
                      value={detailImagePrompt}
                      onChange={(e) => setDetailImagePrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerateDetailImage()}
                      style={{ flex: 1, backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.55rem 0.85rem", color: "var(--text-active)", fontSize: "0.83rem", outline: "none" }}
                    />
                    <button className="btn-primary" onClick={handleGenerateDetailImage} disabled={detailImageLoading}
                      style={{ height: "38px", padding: "0 1rem", fontSize: "0.83rem", whiteSpace: "nowrap" }}>
                      🎨 {detailImageUrl ? "Cambiar imagen" : "Generar imagen"}
                    </button>
                  </div>
                  {!detailImageUrl && !detailImageLoading && (
                    <div style={{ minHeight: "160px", background: "var(--bg-tertiary)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "var(--border-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.6rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      <span style={{ fontSize: "2rem" }}>🎨</span>
                      <p style={{ margin: 0 }}>Haz clic en "Generar imagen" para crear una visual para esta campaña</p>
                    </div>
                  )}
                  {detailImageError && (
                    <div style={{ minHeight: "120px", background: "rgba(248,113,113,0.05)", border: "1px dashed rgba(248,113,113,0.2)", borderRadius: "var(--border-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                      <p style={{ color: "#f87171", fontSize: "0.83rem", margin: 0 }}>No se pudo generar la imagen. Intenta de nuevo.</p>
                    </div>
                  )}
                  {detailImageUrl && !detailImageError && (
                    <div style={{ position: "relative", borderRadius: "var(--border-radius-md)", overflow: "hidden", background: "var(--bg-tertiary)", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {detailImageLoading && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", background: "var(--bg-tertiary)", zIndex: 1 }}>
                          <div className="pulse-element" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }} />
                          <p className="pulse-element" style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>Generando imagen...</p>
                        </div>
                      )}
                      <img
                        src={detailImageUrl}
                        alt={`Campaña ${detailModal.input?.product}`}
                        onLoad={() => setDetailImageLoading(false)}
                        onError={() => { setDetailImageLoading(false); setDetailImageError(true); }}
                        style={{ width: "100%", borderRadius: "var(--border-radius-md)", display: detailImageLoading ? "none" : "block" }}
                      />
                    </div>
                  )}
                </div>
              )}
              {/* Video Script — generación para campaña/copy/hashtag */}
              {(detailModal.type === "campaign" || detailModal.type === "copy" || detailModal.type === "hashtag") && (
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                      🎬 Video Script para este contenido
                    </p>
                    {detailVideoResult && !detailVideoLoading && (
                      <button onClick={handleDownloadDetailVideo}
                        style={{ height: "30px", padding: "0 0.75rem", fontSize: "0.75rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", color: "var(--text-soft)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Descargar
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "0.85rem" }}>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                      <label style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.3rem" }}>Formato</label>
                      <select value={detailVideoForm.format} onChange={(e) => setDetailVideoForm((f) => ({ ...f, format: e.target.value }))}
                        style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.55rem 0.8rem", color: "var(--text-active)", fontSize: "0.83rem", outline: "none" }}>
                        {["Reel de Instagram","TikTok","YouTube Short","Historia / Story","YouTube largo","LinkedIn Video"].map((f) => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: "130px" }}>
                      <label style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.3rem" }}>Duración</label>
                      <select value={detailVideoForm.duration} onChange={(e) => setDetailVideoForm((f) => ({ ...f, duration: e.target.value }))}
                        style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.55rem 0.8rem", color: "var(--text-active)", fontSize: "0.83rem", outline: "none" }}>
                        {["15 segundos","30 segundos","60 segundos","3 minutos","5 minutos"].map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <button className="btn-primary" onClick={handleGenerateDetailVideo} disabled={detailVideoLoading}
                      style={{ height: "38px", padding: "0 1.1rem", fontSize: "0.83rem", whiteSpace: "nowrap" }}>
                      {detailVideoLoading ? "Generando..." : `🎬 ${detailVideoResult ? "Regenerar" : "Generar"} Video Script`}
                    </button>
                  </div>

                  {detailVideoLoading && (
                    <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.83rem" }}>
                      <div className="pulse-element" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", margin: "0 auto 0.75rem" }} />
                      Escribiendo el guion escena por escena...
                    </div>
                  )}

                  {!detailVideoResult && !detailVideoLoading && (
                    <div style={{ minHeight: "80px", background: "var(--bg-tertiary)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "var(--border-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", color: "var(--text-muted)", fontSize: "0.83rem" }}>
                      <span style={{ fontSize: "1.5rem" }}>🎬</span>
                      Elige formato y duración, luego haz clic en "Generar Video Script"
                    </div>
                  )}

                  {detailVideoResult && !detailVideoLoading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ background: "rgba(201,105,43,0.06)", border: "1px solid rgba(201,105,43,0.35)", borderRadius: "var(--border-radius-sm)", padding: "0.9rem" }}>
                        <p style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--accent-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>🎣 Hook — primeros 3 segundos</p>
                        <p style={{ color: "var(--text-active)", fontSize: "0.95rem", fontWeight: "700", lineHeight: "1.5", margin: 0 }}>"{detailVideoResult.hook}"</p>
                      </div>

                      <div>
                        <p style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.45rem" }}>🎬 Escenas ({detailVideoResult.scenes?.length})</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {(detailVideoResult.scenes || []).map((scene, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "46px 1fr", gap: "0.55rem", padding: "0.7rem", background: "var(--bg-tertiary)", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-color)" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
                                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.7rem" }}>{i + 1}</div>
                                <span style={{ fontSize: "0.57rem", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>{scene.time}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                <p style={{ fontSize: "0.76rem", color: "var(--text-soft)", margin: 0 }}><span style={{ fontWeight: "700" }}>📷 </span>{scene.visual}</p>
                                <p style={{ fontSize: "0.76rem", color: "var(--text-main)", margin: 0 }}><span style={{ fontWeight: "700" }}>🎤 </span>{scene.narration}</p>
                                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>✂️ {scene.transition}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                        <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.8rem" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                            <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>📝 Caption</p>
                            <button onClick={() => { navigator.clipboard.writeText(detailVideoResult.caption); showToast("Caption copiado ✓", "success"); }}
                              style={{ background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.3)", borderRadius: "var(--border-radius-sm)", padding: "0.15rem 0.45rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.67rem", fontWeight: "700" }}>
                              Copiar
                            </button>
                          </div>
                          <p style={{ fontSize: "0.78rem", color: "var(--text-main)", lineHeight: "1.6", margin: 0 }}>{detailVideoResult.caption}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.8rem", flex: 1 }}>
                            <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>🚀 CTA</p>
                            <p style={{ fontSize: "0.82rem", color: "var(--text-active)", fontWeight: "700", margin: 0 }}>{detailVideoResult.cta}</p>
                          </div>
                          <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.8rem", flex: 1 }}>
                            <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>🎵 Música</p>
                            <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", margin: 0 }}>{detailVideoResult.musicTip}</p>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.8rem" }}>
                        <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.4rem" }}>💡 Tips de producción</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.22rem" }}>
                          {(detailVideoResult.productionTips || "").split(";").map((tip, i) => tip.trim() && (
                            <div key={i} style={{ display: "flex", gap: "0.45rem", alignItems: "flex-start" }}>
                              <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(201,105,43,0.15)", color: "var(--accent-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "800", flexShrink: 0, marginTop: "2px" }}>{i + 1}</span>
                              <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", margin: 0, lineHeight: "1.5" }}>{tip.trim()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Sección adjuntar video propio ── */}
              <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                    🎞️ Video adjunto a esta campaña
                  </p>
                  {detailAttachedVideo && (
                    <button onClick={async () => {
                      await updateVideoUrlAPI(String(detailModal._id), null);
                      setDetailAttachedVideo(null);
                      setHistory((prev) => prev.map((h) => h._id === detailModal._id ? { ...h, videoUrl: null } : h));
                      showToast("Video eliminado", "success");
                    }}
                      style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--border-radius-sm)", padding: "0.2rem 0.6rem", color: "#f87171", cursor: "pointer", fontSize: "0.72rem" }}>
                      Quitar video
                    </button>
                  )}
                </div>

                {/* Reproductor si hay video */}
                {detailAttachedVideo && (
                  <div style={{ marginBottom: "1rem" }}>
                    {detailAttachedVideo.includes("youtube.com") || detailAttachedVideo.includes("youtu.be") ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${detailAttachedVideo.split("v=")[1]?.split("&")[0] || detailAttachedVideo.split("/").pop()}`}
                        style={{ width: "100%", height: "300px", borderRadius: "var(--border-radius-md)", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : detailAttachedVideo.startsWith("data:video") || /\.(mp4|webm|mov|ogg)$/i.test(detailAttachedVideo) ? (
                      <video controls style={{ width: "100%", borderRadius: "var(--border-radius-md)", maxHeight: "320px", background: "#000" }}>
                        <source src={detailAttachedVideo} />
                      </video>
                    ) : (
                      <a href={detailAttachedVideo} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", color: "var(--accent-secondary)", fontSize: "0.85rem", textDecoration: "none", fontWeight: "600" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        Ver video adjunto →
                      </a>
                    )}
                  </div>
                )}

                {/* Controles para subir o enlazar */}
                <input type="file" accept="video/*" ref={detailVideoFileRef} style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 50 * 1024 * 1024) {
                      showToast("El video supera 50MB. Usa un enlace de YouTube, Drive o Dropbox.", "error");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      const dataUrl = ev.target.result;
                      setDetailAttachedVideo(dataUrl);
                      try {
                        await updateVideoUrlAPI(String(detailModal._id), dataUrl);
                        setHistory((prev) => prev.map((h) => h._id === detailModal._id ? { ...h, videoUrl: dataUrl } : h));
                        showToast("Video subido y guardado ✓", "success");
                      } catch { showToast("No se pudo guardar el video", "error"); }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />

                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <button onClick={() => detailVideoFileRef.current?.click()}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(201,105,43,0.12)", border: "1.5px solid var(--accent-secondary)", borderRadius: "var(--border-radius-sm)", padding: "0.5rem 0.9rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700", flexShrink: 0, boxShadow: "0 0 8px rgba(201,105,43,0.2)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Subir video
                  </button>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", flexShrink: 0 }}>o pega un enlace</span>
                  <input
                    value={detailVideoLinkInput}
                    onChange={(e) => setDetailVideoLinkInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key !== "Enter" || !detailVideoLinkInput.trim()) return;
                      const url = detailVideoLinkInput.trim();
                      setDetailAttachedVideo(url);
                      setDetailVideoLinkInput("");
                      try {
                        await updateVideoUrlAPI(String(detailModal._id), url);
                        setHistory((prev) => prev.map((h) => h._id === detailModal._id ? { ...h, videoUrl: url } : h));
                        showToast("Enlace guardado ✓", "success");
                      } catch { showToast("No se pudo guardar el enlace", "error"); }
                    }}
                    placeholder="YouTube, Google Drive, Dropbox… (Enter para guardar)"
                    style={{ flex: 1, backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.5rem 0.85rem", color: "var(--text-active)", fontSize: "0.82rem", outline: "none" }}
                  />
                </div>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                  Archivos hasta 50MB · Para videos más grandes usa un enlace externo
                </p>
              </div>
            </div>

            {/* Footer con acciones */}
            <div style={{ padding: "1rem 1.75rem", borderTop: "1px solid var(--border-color)", display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap", flexShrink: 0 }}>
              {(detailModal.type === "campaign" || detailModal.type === "copy" || detailModal.type === "hashtag") && (
                <button
                  onClick={() => { setRefineModal(detailModal); setRefineResult(""); closeDetailModal(); }}
                  style={{ background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.3)", color: "var(--accent-secondary)", borderRadius: "var(--border-radius-sm)", padding: "0.45rem 0.9rem", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>
                  ✨ Perfeccionar con IA
                </button>
              )}
              <button
                onClick={() => {
                  const text = Array.isArray(detailModal.output) ? detailModal.output.join("\n") : typeof detailModal.output === "object" ? JSON.stringify(detailModal.output, null, 2) : detailModal.output;
                  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = `${detailModal.type}-${detailModal.input?.product || "resultado"}-${Date.now()}.txt`; a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-soft)", borderRadius: "var(--border-radius-sm)", padding: "0.45rem 0.9rem", fontSize: "0.8rem", cursor: "pointer" }}>
                ↓ Descargar .txt
              </button>
              <button
                onClick={closeDetailModal}
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-muted)", borderRadius: "var(--border-radius-sm)", padding: "0.45rem 0.9rem", fontSize: "0.8rem", cursor: "pointer" }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {refineModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={() => setRefineModal(null)}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", padding: "2rem", width: "92vw", maxWidth: "920px", maxHeight: "92vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ color: "var(--text-active)", fontWeight: "800", fontSize: "1.1rem", marginBottom: "0.2rem" }}>✨ Perfeccionar con IA</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  La IA mejorará este {TYPE_LABELS[refineModal.type] || refineModal.type} haciéndolo más persuasivo y profesional
                </p>
              </div>
              <button onClick={() => setRefineModal(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
                Original — {refineModal.input?.product}
              </p>
              <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "1rem", fontSize: "0.83rem", color: "var(--text-soft)", lineHeight: "1.6", maxHeight: "260px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                {Array.isArray(refineModal.output) ? refineModal.output.join(" ") : refineModal.output}
              </div>
            </div>

            {!refineResult ? (
              <button className="btn-primary" onClick={handleRefine} disabled={refineLoading} style={{ width: "100%", height: "46px", fontSize: "0.9rem" }}>
                {refineLoading ? (
                  <><span className="pulse-element">⏳</span>&nbsp; Perfeccionando con IA...</>
                ) : "✨ Perfeccionar ahora"}
              </button>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--accent-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    ✨ Versión Perfeccionada
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={handleDownloadRefineResult}
                      style={{ background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.3rem 0.7rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem" }}>
                      ↓ .txt
                    </button>
                    <button onClick={handleCopyRefineResult}
                      style={{ background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.3)", borderRadius: "var(--border-radius-sm)", padding: "0.3rem 0.8rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600" }}>
                      Copiar
                    </button>
                  </div>
                </div>
                <div style={{ background: "var(--bg-tertiary)", border: "1px solid rgba(201,105,43,0.2)", borderLeft: "3px solid var(--accent-primary)", borderRadius: "var(--border-radius-sm)", padding: "1.5rem", fontSize: "0.925rem", color: "var(--text-main)", lineHeight: "1.8", whiteSpace: "pre-wrap", maxHeight: "480px", overflowY: "auto" }}>
                  {refineResult}
                </div>
                <button className="btn-primary" onClick={handleRefine} disabled={refineLoading}
                  style={{ width: "100%", height: "40px", fontSize: "0.85rem", marginTop: "0.75rem", backgroundImage: "none", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-soft)" }}>
                  Generar otra versión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    );
  };

  /* ── REDES SOCIALES ── */
  const loadSocialCreds = async () => {
    setSocialLoadingCreds(true);
    try {
      const data = await getSocialCredentialsAPI();
      setSocialCreds(data.credentials);
    } catch { /* silencioso */ }
    finally { setSocialLoadingCreds(false); }
  };

  const handleSocialSave = async (platformId) => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return;
    const allFilled = platform.fields.every((f) => (socialForm[f.key] || "").trim());
    if (!allFilled) return;
    setSocialSaving(true);
    try {
      const credentials = {};
      platform.fields.forEach((f) => { credentials[f.key] = socialForm[f.key].trim(); });
      await saveSocialCredentialsAPI(platformId, credentials);
      await loadSocialCreds();
      setSocialForm({});
      setSocialOpenForm(null);
      showToast(`Cuenta de ${platform.label} conectada ✓`, "success");
    } catch { showToast("Error al guardar credenciales", "error"); }
    finally { setSocialSaving(false); }
  };

  const handleSocialDisconnect = async (platform) => {
    setSocialDisconnecting(platform);
    try {
      await disconnectSocialAPI(platform);
      await loadSocialCreds();
      showToast("Cuenta desconectada", "info");
    } catch { showToast("Error al desconectar", "error"); }
    finally { setSocialDisconnecting(null); }
  };

  const handleMetaConnect = async () => {
    setSocialConnecting("meta");
    try {
      const { url } = await getMetaConnectUrlAPI();
      window.location.href = url;
    } catch {
      showToast("No se pudo iniciar la conexión con Meta", "error");
      setSocialConnecting(null);
    }
  };

  const handleTikTokConnect = async () => {
    setSocialConnecting("tiktok");
    try {
      const { url } = await getTikTokConnectUrlAPI();
      window.location.href = url;
    } catch {
      showToast("No se pudo iniciar la conexión con TikTok", "error");
      setSocialConnecting(null);
    }
  };

  const handleSelectMetaPage = async (pageId) => {
    setMetaSelectingPage(true);
    try {
      await selectMetaPageAPI(pageId);
      setMetaPendingPages(null);
      await loadSocialCreds();
      showToast("Página conectada ✓", "success");
    } catch {
      showToast("Error al seleccionar la página", "error");
    } finally {
      setMetaSelectingPage(false);
    }
  };

  const FB_LOGO = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
  const IG_LOGO = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );

  const TT_LOGO = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
  const TW_LOGO = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  const LI_LOGO = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  const SOCIAL_PLATFORMS = [
    { id: "facebook", label: "Facebook", logo: FB_LOGO,
      badge: null, oauth: "meta",
      fields: [],
      note: "Se conecta junto con Instagram con un solo clic — misma cuenta de Meta." },
    { id: "instagram", label: "Instagram", logo: IG_LOGO,
      badge: null, oauth: "meta",
      fields: [],
      note: "Tu cuenta debe ser Business o Creator y estar enlazada a la Página de Facebook que elijas al conectar." },
    { id: "tiktok", label: "TikTok", logo: TT_LOGO,
      badge: null, oauth: "tiktok",
      fields: [],
      note: "Mientras la app no esté auditada por TikTok, los videos publicados quedan como borrador privado — hay que abrir la app de TikTok y darle Publicar a mano." },
    { id: "twitter", label: "Twitter / X", logo: TW_LOGO,
      badge: null,
      fields: [
        { key: "apiKey", label: "API Key", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
        { key: "apiSecret", label: "API Key Secret", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
        { key: "accessToken", label: "Access Token", placeholder: "1234567890-xxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
        { key: "accessTokenSecret", label: "Access Token Secret", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
      ],
      instructions: ["Ve a developer.twitter.com y crea un proyecto + app", "En 'Settings', activa permisos de Read and Write", "En 'Keys and Tokens' genera: API Key, API Secret, Access Token y Access Token Secret", "Asegúrate de que el Access Token tenga permisos de escritura (no solo lectura)", "Guarda los 4 tokens — todos son necesarios para firmar los tweets con OAuth 1.0a"] },
    { id: "linkedin", label: "LinkedIn", logo: LI_LOGO,
      badge: null,
      fields: [
        { key: "accessToken", label: "Access Token OAuth 2.0", placeholder: "AQXxxxxxxxxxxxxxxxxx...", type: "text" },
        { key: "pageId", label: "Author URN", placeholder: "Ej: urn:li:person:ABC123XYZ", type: "text" },
      ],
      instructions: ["Ve a linkedin.com/developers y crea una app asociada a una Página de empresa", "Solicita los productos 'Share on LinkedIn' y 'Sign In with LinkedIn'", "En OAuth 2.0 tools genera un Access Token con scopes: w_member_social, r_liteprofile", "El Author URN tiene el formato urn:li:person:XXXXXXXX — lo obtienes de GET /v2/me", "Los tokens de LinkedIn expiran cada 60 días — recuerda renovarlos"] },
  ];

  const renderSocialMedia = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-active)", letterSpacing: "-0.03em", margin: 0 }}>Redes Sociales</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.3rem" }}>Conecta tus cuentas para publicar el contenido generado directamente desde la app.</p>
      </div>

      {metaPendingPages && (
        <div className="section-card" style={{ border: "1px solid rgba(201,105,43,0.35)" }}>
          <p style={{ color: "var(--text-active)", fontWeight: "700", fontSize: "0.9rem", marginBottom: "0.3rem" }}>Elige qué Página de Facebook conectar</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "1rem" }}>Tu cuenta administra varias Páginas. La que elijas se usará para publicar en Facebook y, si tiene una cuenta de Instagram enlazada, también en Instagram.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {metaPendingPages.map((p) => (
              <button key={p.id} onClick={() => handleSelectMetaPage(p.id)} disabled={metaSelectingPage}
                style={{ textAlign: "left", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.7rem 0.9rem", color: "var(--text-soft)", cursor: "pointer", fontSize: "0.85rem" }}>
                <strong style={{ color: "var(--text-active)" }}>{p.name}</strong>
                {p.hasInstagram && <span style={{ color: "var(--accent-secondary)", marginLeft: "0.5rem" }}>· Instagram: @{p.instagramUsername}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {socialLoadingCreds ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Cargando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {SOCIAL_PLATFORMS.map((platform) => {
            const cred = socialCreds[platform.id];
            const isOpen = socialOpenForm === platform.id;
            const showInstr = socialShowInstructions === platform.id;
            const isConnecting = socialConnecting === platform.oauth;
            return (
              <div key={platform.id} className="section-card" style={{ border: `1px solid ${cred?.connected ? "rgba(201,105,43,0.3)" : "var(--border-color)"}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "var(--border-radius-md)", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--text-soft)" }}>
                      {platform.logo}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <p style={{ color: "var(--text-active)", fontWeight: "700", fontSize: "0.95rem", margin: 0 }}>{platform.label}</p>
                      </div>
                      {cred?.connected ? (
                        <p style={{ color: "var(--accent-secondary)", fontSize: "0.75rem", margin: 0, marginTop: "0.1rem" }}>Conectado · {platform.id === "twitter" ? "API Key" : "ID"}: {cred.pageId}</p>
                      ) : (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: 0, marginTop: "0.1rem" }}>Sin conectar</p>
                      )}
                    </div>
                  </div>
                  {cred?.connected ? (
                    <button
                      onClick={() => handleSocialDisconnect(platform.id)}
                      disabled={socialDisconnecting === platform.id}
                      style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-muted)", borderRadius: "var(--border-radius-sm)", padding: "0.4rem 1rem", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
                    >
                      {socialDisconnecting === platform.id ? "..." : "Desconectar"}
                    </button>
                  ) : platform.oauth ? (
                    <button
                      onClick={platform.oauth === "meta" ? handleMetaConnect : handleTikTokConnect}
                      disabled={isConnecting}
                      className="btn-primary"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", height: "auto" }}
                    >
                      {isConnecting ? "Redirigiendo..." : `Conectar con ${platform.oauth === "meta" ? "Meta" : "TikTok"}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSocialOpenForm(isOpen ? null : platform.id); setSocialForm({}); setSocialShowInstructions(null); }}
                      className="btn-primary"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", height: "auto" }}
                    >
                      {isOpen ? "Cancelar" : "Conectar"}
                    </button>
                  )}
                </div>

                {platform.oauth && (
                  <p style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border-color)", color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: "1.5" }}>
                    {platform.note}
                  </p>
                )}

                {!platform.oauth && !cred?.connected && isOpen && (
                  <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <button
                      onClick={() => setSocialShowInstructions(showInstr ? null : platform.id)}
                      style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--accent-secondary)", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                    >
                      {showInstr ? "Ocultar instrucciones" : "¿Cómo obtengo el token? →"}
                    </button>
                    {showInstr && (
                      <ol style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {platform.instructions.map((step, i) => (
                          <li key={i} style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: "1.5" }}>{step}</li>
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
                          value={socialForm[field.key] || ""}
                          onChange={(e) => setSocialForm((f) => ({ ...f, [field.key]: e.target.value }))}
                          style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.8rem", color: "var(--text-active)", fontSize: "0.83rem", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                    ))}
                    <button className="btn-primary"
                      onClick={() => handleSocialSave(platform.id)}
                      disabled={socialSaving || !platform.fields.every((f) => (socialForm[f.key] || "").trim())}
                      style={{ height: "42px", fontSize: "0.88rem" }}>
                      {socialSaving ? "Guardando..." : `Conectar ${platform.label}`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="section-card" style={{ background: "var(--accent-subtle)", border: "1px solid rgba(201,105,43,0.15)" }}>
        <p style={{ color: "var(--accent-secondary)", fontWeight: "700", fontSize: "0.85rem", marginBottom: "0.4rem" }}>¿Cómo funciona la publicación?</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: "1.6", margin: 0 }}>
          Una vez conectada la cuenta, genera tu campaña, copy o hashtags y haz clic en el botón <strong style={{ color: "var(--text-soft)" }}>Publicar</strong> que aparece en el resultado. Se abrirá un modal donde seleccionas la plataforma y publicas con un clic. Instagram requiere que también hayas generado una imagen; TikTok requiere que hayas generado un video.
        </p>
      </div>
    </div>
  );

  /* ── RENDER PRINCIPAL ── */
  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="app-body">
        <Header activeTab={activeTab} />
        <div className="main-content">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "trends"    && renderTrends()}
          {activeTab === "history"   && renderHistory()}
          {activeTab === "calendar"  && renderCalendar()}
          {activeTab === "social"    && renderSocialMedia()}
          {activeTab === "video"        && renderVideoStudio()}
          {activeTab === "imagestudio"  && renderImageStudio()}
          {(activeTab === "campaign" || activeTab === "copy" || activeTab === "hashtag") && (
            <>
              <CampaignForm
                activeTab={activeTab}
                formData={formData}
                handleChange={handleChange}
                handleGenerate={handleGenerate}
                loading={loading}
              />
              <ResultCard result={result} activeTab={activeTab} loading={loading} generationId={generationId} onFavorite={toggleFavorite} onPublish={() => setPublishModalOpen({ content: result, imageUrl })} />

              {result && !loading && (
                <div className="section-card" style={{ marginTop: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0 }}>🎬 Video Script para esta pieza</h2>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Genera un guion de video basado en el contenido generado</p>
                    </div>
                    {inlineVideoResult && (
                      <button onClick={handleDownloadInlineVideo} style={{ height: "36px", padding: "0 0.9rem", fontSize: "0.85rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", color: "var(--text-soft)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Descargar
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "1.1rem" }}>
                    <div style={{ flex: 1, minWidth: "160px" }}>
                      <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>Formato</label>
                      <select value={inlineVideoForm.format} onChange={(e) => setInlineVideoForm((f) => ({ ...f, format: e.target.value }))}
                        style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.9rem", color: "var(--text-active)", fontSize: "0.85rem", outline: "none" }}>
                        {["Reel de Instagram", "TikTok", "YouTube Short", "Historia / Story", "YouTube largo", "LinkedIn Video"].map((f) => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: "140px" }}>
                      <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.35rem" }}>Duración</label>
                      <select value={inlineVideoForm.duration} onChange={(e) => setInlineVideoForm((f) => ({ ...f, duration: e.target.value }))}
                        style={{ width: "100%", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.9rem", color: "var(--text-active)", fontSize: "0.85rem", outline: "none" }}>
                        {["15 segundos", "30 segundos", "60 segundos", "3 minutos", "5 minutos"].map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <button className="btn-primary" onClick={handleGenerateInlineVideo}
                      disabled={inlineVideoLoading || !formData.product.trim()}
                      style={{ height: "38px", padding: "0 1.2rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {inlineVideoLoading ? "Generando..." : `🎬 ${inlineVideoResult ? "Regenerar" : "Generar"} Video Script`}
                    </button>
                  </div>

                  {inlineVideoLoading && (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      <div className="pulse-element" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", margin: "0 auto 1rem" }} />
                      Escribiendo el guion escena por escena...
                    </div>
                  )}

                  {!inlineVideoResult && !inlineVideoLoading && (
                    <div style={{ minHeight: "100px", background: "var(--bg-tertiary)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "var(--border-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      <span style={{ fontSize: "1.8rem" }}>🎬</span>
                      <p style={{ margin: 0 }}>Elige formato y duración, luego haz clic en "Generar Video Script"</p>
                    </div>
                  )}

                  {inlineVideoResult && !inlineVideoLoading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      <div style={{ background: "rgba(201,105,43,0.06)", border: "1px solid rgba(201,105,43,0.35)", borderRadius: "var(--border-radius-sm)", padding: "1rem" }}>
                        <p style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--accent-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.4rem" }}>🎣 Hook — primeros 3 segundos</p>
                        <p style={{ color: "var(--text-active)", fontSize: "1rem", fontWeight: "700", lineHeight: "1.5", margin: 0 }}>"{inlineVideoResult.hook}"</p>
                      </div>

                      <div>
                        <p style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>🎬 Escenas ({inlineVideoResult.scenes?.length})</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                          {(inlineVideoResult.scenes || []).map((scene, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "0.6rem", padding: "0.75rem", background: "var(--bg-tertiary)", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-color)" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.72rem" }}>{i + 1}</div>
                                <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>{scene.time}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.22rem" }}>
                                <p style={{ fontSize: "0.77rem", color: "var(--text-soft)", margin: 0 }}><span style={{ fontWeight: "700" }}>📷 </span>{scene.visual}</p>
                                <p style={{ fontSize: "0.77rem", color: "var(--text-main)", margin: 0 }}><span style={{ fontWeight: "700" }}>🎤 </span>{scene.narration}</p>
                                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>✂️ {scene.transition}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.85rem" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                            <p style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>📝 Caption</p>
                            <button onClick={() => { navigator.clipboard.writeText(inlineVideoResult.caption); showToast("Caption copiado ✓", "success"); }}
                              style={{ background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.3)", borderRadius: "var(--border-radius-sm)", padding: "0.18rem 0.5rem", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.68rem", fontWeight: "700" }}>
                              Copiar
                            </button>
                          </div>
                          <p style={{ fontSize: "0.79rem", color: "var(--text-main)", lineHeight: "1.6", margin: 0 }}>{inlineVideoResult.caption}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.85rem", flex: 1 }}>
                            <p style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>🚀 CTA</p>
                            <p style={{ fontSize: "0.82rem", color: "var(--text-active)", fontWeight: "700", margin: 0 }}>{inlineVideoResult.cta}</p>
                          </div>
                          <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.85rem", flex: 1 }}>
                            <p style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>🎵 Música</p>
                            <p style={{ fontSize: "0.79rem", color: "var(--text-soft)", margin: 0 }}>{inlineVideoResult.musicTip}</p>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.85rem" }}>
                        <p style={{ fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.45rem" }}>💡 Tips de producción</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {(inlineVideoResult.productionTips || "").split(";").map((tip, i) => tip.trim() && (
                            <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                              <span style={{ width: "17px", height: "17px", borderRadius: "50%", background: "rgba(201,105,43,0.15)", color: "var(--accent-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: "800", flexShrink: 0, marginTop: "2px" }}>{i + 1}</span>
                              <p style={{ fontSize: "0.79rem", color: "var(--text-soft)", margin: 0, lineHeight: "1.5" }}>{tip.trim()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "campaign" && result && !loading && (
                <div className="section-card" style={{ marginTop: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div>
                      <h2 className="section-title" style={{ margin: 0 }}>Imagen para la campaña</h2>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Descríbela tú o déjala en blanco para generarla automáticamente</p>
                    </div>
                    {imageUrl && !imageLoading && !imageError && (
                      <button onClick={handleDownloadImage} style={{ height: "36px", padding: "0 0.9rem", fontSize: "0.85rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", color: "var(--text-soft)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Descargar
                      </button>
                    )}
                  </div>

                  {/* Input descripción personalizada */}
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                    <input
                      type="text"
                      placeholder="Ej: cafetería acogedora con luz cálida, sin texto ni letras — o déjalo vacío para generar automáticamente"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerateImage()}
                      style={{ flex: 1, backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.6rem 0.9rem", color: "var(--text-active)", fontSize: "0.83rem", outline: "none" }}
                    />
                    <button className="btn-primary" onClick={handleGenerateImage} style={{ height: "38px", padding: "0 1.1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      🎨 {imageUrl ? "Regenerar" : "Generar imagen"}
                    </button>
                  </div>

                  {!imageUrl ? (
                    <div style={{ minHeight: "200px", background: "var(--bg-tertiary)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "var(--border-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      <span style={{ fontSize: "2rem" }}>🎨</span>
                      <p>Haz clic en "Generar imagen" para crear una visual para esta campaña</p>
                    </div>
                  ) : imageError ? (
                    <div style={{ minHeight: "200px", background: "var(--bg-tertiary)", border: "1px dashed rgba(248,113,113,0.2)", borderRadius: "var(--border-radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#f87171", fontSize: "0.9rem" }}>
                      <span style={{ fontSize: "2rem" }}>⚠️</span>
                      <p>No se pudo generar la imagen. Intenta de nuevo.</p>
                      <button className="btn-primary" onClick={handleGenerateImage} style={{ height: "36px", padding: "0 1rem", fontSize: "0.85rem" }}>Reintentar</button>
                    </div>
                  ) : (
                    <div style={{ position: "relative", borderRadius: "var(--border-radius-md)", overflow: "hidden", background: "var(--bg-tertiary)", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {imageLoading && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", background: "var(--bg-tertiary)", zIndex: 1 }}>
                          <div className="pulse-element" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }} />
                          <p className="pulse-element" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Generando imagen, puede tomar unos segundos...</p>
                        </div>
                      )}
                      <img
                        src={imageUrl}
                        alt={`Campaña ${formData.product}`}
                        onLoad={handleImageLoaded}
                        onError={() => { setImageLoading(false); setImageError(true); }}
                        style={{ width: "100%", borderRadius: "var(--border-radius-md)", display: imageLoading ? "none" : "block" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <PublishModal
        isOpen={!!publishModalOpen}
        onClose={() => { setPublishModalOpen(null); setHistorySearch(""); loadHistory(); }}
        content={publishModalOpen?.content}
        imageUrl={publishModalOpen?.imageUrl}
        videoUrl={publishModalOpen?.videoUrl}
      />
    </div>
  );
}

export default Home;
