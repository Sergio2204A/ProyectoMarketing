import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CampaignForm from "../components/CampaignForm";
import ResultCard from "../components/ResultCard";
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
} from "../services/campaignService";

const TYPE_LABELS = { campaign: "Campaña", copy: "Copy", hashtag: "Hashtags", calendar: "Calendario" };

function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({ product: "", goal: "", audience: "", channel: "" });

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
  const [calAiForm, setCalAiForm] = useState({ product: "", platform: "Instagram", goal: "" });
  const [calAiLoading, setCalAiLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getHistory();
      setHistory(data.history);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => { setResult(""); }, [activeTab]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    try {
      let response;
      if (activeTab === "campaign") { response = await generateCampaign(formData); setResult(response.campaign); }
      else if (activeTab === "copy") { response = await generateCopy({ product: formData.product, audience: formData.audience }); setResult(response.copy); }
      else if (activeTab === "hashtag") { response = await generateHashtags({ product: formData.product }); setResult(response.hashtags); }
      await loadHistory();
    } catch (error) {
      setResult("Ocurrió un error al generar el contenido. Verifica que el servidor esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const data = await toggleFavoriteAPI(id);
      setHistory((prev) => prev.map((item) => item._id === id ? { ...item, isFavorite: data.isFavorite } : item));
    } catch (err) { console.error(err); }
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
      setActiveTab("calendar");
    } catch (err) { console.error(err); }
    finally { setCalAiLoading(false); }
  };

  const deleteHistoryItem = async (id) => {
    try { await deleteHistoryItemAPI(id); setHistory((prev) => prev.filter((item) => item._id !== id)); }
    catch (err) { console.error(err); }
  };

  const clearHistory = async () => {
    try { await clearHistoryAPI(); setHistory([]); }
    catch (err) { console.error(err); }
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

  /* ── TENDENCIAS ── */
  const handleGenerateTrends = async () => {
    if (!trendsTopic.trim()) return;
    setTrendsLoading(true);
    try {
      const data = await generateTrendsAPI(trendsTopic.trim());
      setTrends(data.trends.map((t, i) => ({ ...t, id: `ai-${Date.now()}-${i}` })));
    } catch (err) { console.error(err); }
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
          <div key={trend.id} style={{ border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "var(--border-radius-md)", backgroundColor: "var(--bg-card)", position: "relative" }}>
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
    ];
    const filtered = history.filter((item) => {
      if (historyFilter === "all") return true;
      if (historyFilter === "favorites") return item.isFavorite;
      return item.type === historyFilter;
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
              <div key={item._id} style={{ border: `1px solid ${item.isFavorite ? "rgba(250,204,21,0.3)" : "var(--border-color)"}`, borderRadius: "var(--border-radius-md)", padding: "1.25rem 1.5rem", backgroundColor: "var(--bg-tertiary)", position: "relative" }}>
                <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => toggleFavorite(item._id)} title={item.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                    style={{ background: "transparent", border: "none", fontSize: "1.1rem", cursor: "pointer", lineHeight: 1, opacity: item.isFavorite ? 1 : 0.4 }}>
                    {item.isFavorite ? "⭐" : "☆"}
                  </button>
                  <button onClick={() => deleteHistoryItem(item._id)} title="Eliminar"
                    style={{ background: "transparent", color: "#ef4444", border: "none", fontSize: "1rem", cursor: "pointer", lineHeight: 1, opacity: 0.6 }}>✕</button>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "0.7rem", background: "rgba(201,105,43,0.15)", color: "#f5b27a", padding: "0.2rem 0.55rem", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {TYPE_LABELS[item.type] || item.type}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <h4 style={{ color: "var(--text-active)", fontSize: "0.9rem", marginBottom: "0.25rem", paddingRight: "4rem", fontWeight: "600" }}>
                  {item.input?.product || "Sin nombre"}
                </h4>
                <details style={{ marginTop: "0.75rem" }}>
                  <summary style={{ color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" }}>Ver resultado</summary>
                  <div style={{ marginTop: "0.75rem", padding: "1rem", backgroundColor: "rgba(11,15,25,0.4)", borderRadius: "var(--border-radius-sm)", color: "var(--text-main)", fontSize: "0.875rem", lineHeight: "1.7", whiteSpace: "pre-wrap", borderLeft: "2px solid var(--accent-primary)" }}>
                    {Array.isArray(item.output) ? item.output.join(" ") : typeof item.output === "object" ? JSON.stringify(item.output, null, 2) : item.output}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
          {(activeTab === "campaign" || activeTab === "copy" || activeTab === "hashtag") && (
            <>
              <CampaignForm
                activeTab={activeTab}
                formData={formData}
                handleChange={handleChange}
                handleGenerate={handleGenerate}
                loading={loading}
              />
              <ResultCard result={result} activeTab={activeTab} loading={loading} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
