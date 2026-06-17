import { useState } from "react";

function ResultCard({ result, activeTab, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    
    let textToCopy = "";
    if (Array.isArray(result)) {
      textToCopy = result.join(" ");
    } else {
      textToCopy = result;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Un formateador de markdown muy básico y elegante para mostrar texto IA estructurado
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    return text.split("\n").map((line, index) => {
      let trimmed = line.trim();
      
      // Títulos principales: ### Título o 1. **Título**
      if (trimmed.startsWith("###")) {
        return <h3 key={index} style={{ color: "var(--text-active)", marginTop: "1.2rem", marginBottom: "0.5rem", fontSize: "1.2rem" }}>{trimmed.replace(/###\s*/, "")}</h3>;
      }
      if (trimmed.startsWith("##")) {
        return <h2 key={index} style={{ color: "var(--text-active)", marginTop: "1.5rem", marginBottom: "0.6rem", fontSize: "1.35rem" }}>{trimmed.replace(/##\s*/, "")}</h2>;
      }
      if (trimmed.startsWith("#")) {
        return <h1 key={index} style={{ color: "var(--text-active)", marginTop: "1.8rem", marginBottom: "0.8rem", fontSize: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.3rem" }}>{trimmed.replace(/#\s*/, "")}</h1>;
      }

      // Viñetas o listas: - Elemento
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const content = trimmed.replace(/^[-*]\s*/, "");
        return (
          <li key={index} style={{ marginLeft: "1.5rem", marginBottom: "0.4rem", listStyleType: "disc", color: "var(--text-main)" }}>
            {parseBold(content)}
          </li>
        );
      }

      // Líneas vacías
      if (trimmed === "") {
        return <div key={index} style={{ height: "0.6rem" }} />;
      }

      // Párrafos comunes
      return (
        <p key={index} style={{ marginBottom: "0.6rem", lineHeight: "1.6", color: "var(--text-main)" }}>
          {parseBold(line)}
        </p>
      );
    });
  };

  // Función para parsear texto en negrita simple: **texto**
  const parseBold = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      // Los índices impares corresponden a los grupos capturados (es decir, negritas)
      return i % 2 === 1 ? <strong key={i} style={{ color: "var(--text-active)", fontWeight: "600" }}>{part}</strong> : part;
    });
  };

  const hasContent = result && (Array.isArray(result) ? result.length > 0 : result.trim().length > 0);

  return (
    <div className="section-card" style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className="section-title" style={{ margin: 0 }}>Resultado de la Inteligencia Artificial</h2>
        {hasContent && !loading && (
          <button 
            className="btn-primary" 
            onClick={handleCopy}
            style={{ height: "36px", padding: "0 1rem", fontSize: "0.85rem" }}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                ¡Copiado!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copiar
              </>
            )}
          </button>
        )}
      </div>

      <div className={`result-container ${hasContent && !loading ? "has-content" : ""}`}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div className="pulse-element" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }}></div>
            <p className="pulse-element" style={{ color: "var(--text-muted)" }}>Pensando y redactando la mejor opción para ti...</p>
          </div>
        ) : !hasContent ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: "1rem" }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <p>Completa el formulario y haz clic en generar para ver la magia de la IA.</p>
          </div>
        ) : activeTab === "hashtag" && Array.isArray(result) ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", width: "100%", padding: "0.5rem" }}>
            {result.map((tag, index) => (
              <span 
                key={index} 
                className="pulse-element"
                style={{ 
                  background: "rgba(99, 102, 241, 0.12)", 
                  color: "#a5b4fc", 
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  padding: "0.5rem 1rem",
                  borderRadius: "100px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  animation: `pulse ${2 + (index % 3) * 0.5}s infinite`
                }}
                onClick={() => {
                  navigator.clipboard.writeText(tag);
                  alert(`Copiado: ${tag}`);
                }}
                title="Haz clic para copiar este hashtag"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ width: "100%", textAlign: "left", fontSize: "0.98rem" }}>
            {renderFormattedText(result)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultCard;