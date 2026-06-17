import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import CampaignForm from "../components/CampaignForm";
import ResultCard from "../components/ResultCard";
import { 
  generateCampaign, 
  generateCopy, 
  generateHashtags 
} from "../services/campaignService";

function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    product: "",
    goal: "",
    audience: "",
    channel: ""
  });

  // Cargar historial de localStorage al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem("marketing_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const saveToHistory = (type, inputData, outputData) => {
    const newItem = {
      id: Date.now(),
      type,
      input: { ...inputData },
      output: outputData,
      date: new Date().toLocaleString()
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("marketing_history", JSON.stringify(updatedHistory));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    try {
      let response;
      if (activeTab === "campaign") {
        response = await generateCampaign(formData);
        setResult(response.campaign);
        saveToHistory("Campaña", formData, response.campaign);
      } else if (activeTab === "copy") {
        response = await generateCopy({
          product: formData.product,
          audience: formData.audience
        });
        setResult(response.copy);
        saveToHistory("Copy", { product: formData.product, audience: formData.audience }, response.copy);
      } else if (activeTab === "hashtag") {
        response = await generateHashtags({ product: formData.product });
        setResult(response.hashtags);
        saveToHistory("Hashtags", { product: formData.product }, response.hashtags);
      }
    } catch (error) {
      console.error("ERROR GENERATING:", error);
      setResult("Ocurrió un error al intentar generar la información. Por favor, asegúrate de tener configurada tu GEMINI_API_KEY en el backend.");
    } finally {
      setLoading(false);
    }
  };

  // Resetear resultado cuando cambia la pestaña
  useEffect(() => {
    setResult("");
  }, [activeTab]);

  const deleteHistoryItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("marketing_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("marketing_history");
  };

  // Renders de Pestañas Adicionales
  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="section-card">
        <h2 className="section-title">¡Bienvenido a Marketing AI Workspace!</h2>
        <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
          Potencia tu estrategia digital con el poder de la Inteligencia Artificial de Gemini.
          Genera campañas completas, copys publicitarios de alta conversión o hashtags virales en segundos.
          Selecciona una herramienta en el menú de la izquierda o usa los accesos rápidos a continuación.
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
          <button className="btn-primary" onClick={() => setActiveTab("campaign")}>
            🚀 Crear Campaña
          </button>
          <button className="btn-primary" onClick={() => setActiveTab("copy")} style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)" }}>
            ✨ Generar Copy
          </button>
          <button className="btn-primary" onClick={() => setActiveTab("hashtag")} style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)" }}>
            # Buscar Hashtags
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="section-card" style={{ padding: "2rem" }}>
          <h3 style={{ color: "var(--text-active)", marginBottom: "1rem" }}>Estadísticas de Uso</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
                <span>Solicitudes del Mes</span>
                <strong>{history.length} / 500</strong>
              </div>
              <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-tertiary)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (history.length / 500) * 100)}%`, height: "100%", backgroundColor: "var(--accent-primary)" }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
                <span>Precisión del Modelo (Gemini 2.5)</span>
                <strong>98.4%</strong>
              </div>
              <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-tertiary)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "98.4%", height: "100%", backgroundColor: "var(--accent-secondary)" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card" style={{ padding: "2rem" }}>
          <h3 style={{ color: "var(--text-active)", marginBottom: "1rem" }}>Último Generado</h3>
          {history.length > 0 ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span className="pulse-element" style={{ fontSize: "0.75rem", background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", padding: "0.2rem 0.6rem", borderRadius: "50px", fontWeight: "600" }}>
                  {history[0].type}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{history[0].date.split(",")[0]}</span>
              </div>
              <strong style={{ display: "block", color: "var(--text-active)", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                {history[0].input.product}
              </strong>
              <button 
                className="btn-primary" 
                style={{ height: "30px", fontSize: "0.75rem", padding: "0 0.8rem", width: "fit-content" }}
                onClick={() => {
                  setActiveTab("history");
                }}
              >
                Ver en Historial
              </button>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No has generado nada aún en esta sesión.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="section-card">
      <h2 className="section-title">Tendencias de Marketing Digital</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Mantente al día con lo que es tendencia en redes sociales en este momento. Estas palabras clave y estrategias están teniendo el mejor rendimiento actual:
      </p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div style={{ border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "var(--border-radius-md)", backgroundColor: "var(--bg-tertiary)" }}>
          <h4 style={{ color: "#a5b4fc", marginBottom: "0.75rem" }}>🚀 Contenido de Video Corto</h4>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Los Reels de Instagram y TikTok siguen dominando con videos de menos de 15 segundos enfocados en resolver problemas inmediatos o mostrar detrás de cámaras.
          </p>
        </div>
        <div style={{ border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "var(--border-radius-md)", backgroundColor: "var(--bg-tertiary)" }}>
          <h4 style={{ color: "#38bdf8", marginBottom: "0.75rem" }}>🤖 Personalización por IA</h4>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Copys adaptados directamente a micro-nichos con llamadas a la acción ultra-específicas incrementan la conversión de clics en más de un 35%.
          </p>
        </div>
        <div style={{ border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "var(--border-radius-md)", backgroundColor: "var(--bg-tertiary)" }}>
          <h4 style={{ color: "#34d399", marginBottom: "0.75rem" }}>📊 Transparencia de Datos</h4>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Mostrar estadísticas y reviews reales de forma directa dentro de la primera frase de los anuncios en LinkedIn reporta el costo por lead más bajo.
          </p>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="section-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 className="section-title" style={{ margin: 0 }}>Historial de Creaciones</h2>
        {history.length > 0 && (
          <button 
            className="btn-primary" 
            style={{ backgroundColor: "#ef4444", backgroundImage: "none", height: "36px", padding: "0 1rem", fontSize: "0.85rem" }}
            onClick={clearHistory}
          >
            Limpiar Historial
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)" }}>
          <p>No tienes elementos guardados en tu historial.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {history.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                border: "1px solid var(--border-color)", 
                borderRadius: "var(--border-radius-md)", 
                padding: "1.5rem", 
                backgroundColor: "var(--bg-tertiary)",
                position: "relative"
              }}
            >
              <button 
                onClick={() => deleteHistoryItem(item.id)}
                style={{ 
                  position: "absolute", 
                  top: "1.2rem", 
                  right: "1.2rem", 
                  background: "transparent", 
                  color: "#ef4444", 
                  border: "none", 
                  fontSize: "1.1rem", 
                  cursor: "pointer" 
                }}
                title="Eliminar registro"
              >
                ✕
              </button>
              
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", padding: "0.2rem 0.6rem", borderRadius: "50px", fontWeight: "600" }}>
                  {item.type}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.date}</span>
              </div>
              
              <h4 style={{ color: "var(--text-active)", marginBottom: "0.5rem" }}>
                Producto: {item.input.product}
              </h4>
              
              <details style={{ marginTop: "1rem" }}>
                <summary style={{ color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.9rem" }}>Ver resultado generado</summary>
                <div style={{ 
                  marginTop: "1rem", 
                  padding: "1rem", 
                  backgroundColor: "rgba(11, 15, 25, 0.4)", 
                  borderRadius: "var(--border-radius-sm)", 
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  borderLeft: "2px solid var(--accent-primary)"
                }}>
                  {Array.isArray(item.output) ? item.output.join(" ") : item.output}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        {activeTab === "dashboard" && renderDashboard()}
        
        {activeTab === "trends" && renderTrends()}
        
        {activeTab === "history" && renderHistory()}

        {(activeTab === "campaign" || activeTab === "copy" || activeTab === "hashtag") && (
          <>
            <CampaignForm
              activeTab={activeTab}
              formData={formData}
              handleChange={handleChange}
              handleGenerate={handleGenerate}
              loading={loading}
            />

            <ResultCard
              result={result}
              activeTab={activeTab}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Home;