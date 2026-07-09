import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { exportResultToPDF } from "../utils/pdfExport";

// Detecta las variantes "Variación N (Fórmula ...)" que ya pide el prompt de copys.
// Devuelve null si no encuentra al menos 2 (fallback al render de texto normal).
function splitCopyVariants(text) {
  const regex = /(?:^|\n)\s*#{0,3}\s*\*{0,2}(Variaci[oó]n\s*\d+[^\n*]*)\*{0,2}[^\n]*/gi;
  const matches = [...text.matchAll(regex)];
  if (matches.length < 2) return null;

  return matches.map((match, i) => {
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    return { title: match[1].trim(), body: text.slice(start, end).trim() };
  });
}

function ResultCard({ result, activeTab, loading, generationId, product, onFavorite, onPublish }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedVariant, setCopiedVariant] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = async () => {
    if (!generationId) return;
    const next = !isFavorite;
    setIsFavorite(next);
    await onFavorite(generationId);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = Array.isArray(result) ? result.join(" ") : result;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyVariant = (index, body) => {
    navigator.clipboard.writeText(body);
    setCopiedVariant(index);
    setTimeout(() => setCopiedVariant((current) => (current === index ? null : current)), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    exportResultToPDF({ type: activeTab, product, content: result });
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
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {generationId && (
            <button
              onClick={handleFavorite}
              title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
              style={{ height: "36px", padding: "0 0.9rem", fontSize: "0.85rem", background: isFavorite ? "rgba(250,204,21,0.1)" : "transparent", border: `1px solid ${isFavorite ? "rgba(250,204,21,0.4)" : "var(--border-color)"}`, borderRadius: "var(--border-radius-md)", color: isFavorite ? "#b8860b" : "var(--text-soft)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", transition: "all 0.2s" }}
            >
              {isFavorite ? "★" : "☆"} Favorito
            </button>
          )}
          <button
            onClick={handleDownload}
            title="Descargar como PDF"
            style={{ height: "36px", padding: "0 0.9rem", fontSize: "0.85rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", color: "var(--text-soft)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            PDF
          </button>
          <button
            onClick={onPublish}
            style={{ height: "36px", padding: "0 0.9rem", fontSize: "0.85rem", background: "rgba(201,105,43,0.12)", border: "1px solid rgba(201,105,43,0.4)", borderRadius: "var(--border-radius-md)", color: "var(--accent-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Publicar
          </button>
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
          </div>
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
                  showToast(`Copiado: ${tag}`, "success");
                }}
                title="Haz clic para copiar este hashtag"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : activeTab === "copy" && typeof result === "string" && splitCopyVariants(result) ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", width: "100%" }}>
            {splitCopyVariants(result).map((variant, index) => (
              <div
                key={index}
                className="section-card"
                style={{ padding: "1.1rem 1.2rem", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.5rem" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                  <h4 style={{ margin: 0, fontSize: "0.85rem", color: "var(--accent-secondary)", fontWeight: "700" }}>{variant.title}</h4>
                  <button
                    onClick={() => handleCopyVariant(index, variant.body)}
                    style={{ height: "28px", padding: "0 0.7rem", fontSize: "0.72rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", color: "var(--text-soft)", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {copiedVariant === index ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
                <div style={{ fontSize: "0.92rem" }}>{renderFormattedText(variant.body)}</div>
              </div>
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