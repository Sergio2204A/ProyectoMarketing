function CampaignForm({ activeTab, formData, handleChange, handleGenerate, loading }) {
  const getTitle = () => {
    switch (activeTab) {
      case "campaign":
        return "Generador de Campañas IA";
      case "copy":
        return "Generador de Copy Creativo";
      case "hashtag":
        return "Generador de Hashtags IA";
      default:
        return "Generador Inteligente";
    }
  };

  const getButtonText = () => {
    if (loading) return "Generando con IA...";
    switch (activeTab) {
      case "campaign":
        return "Generar Campaña";
      case "copy":
        return "Generar Copys";
      case "hashtag":
        return "Generar Hashtags";
      default:
        return "Generar";
    }
  };

  return (
    <div className="section-card">
      <h2 className="section-title">{getTitle()}</h2>

      <div className="campaign-form">
        {/* Campo Producto siempre se muestra */}
        <div className="form-group">
          <label htmlFor="product">
            {activeTab === "hashtag" ? "Producto o Tema" : "Producto / Servicio"}
          </label>
          <input
            id="product"
            type="text"
            name="product"
            value={formData.product || ""}
            placeholder={activeTab === "hashtag" ? "Ej: Inteligencia Artificial, Fitness" : "Ej: Hamburguesa Premium"}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Campo Objetivo solo para Campañas */}
        {activeTab === "campaign" && (
          <div className="form-group">
            <label htmlFor="goal">Objetivo</label>
            <input
              id="goal"
              type="text"
              name="goal"
              value={formData.goal || ""}
              placeholder="Ej: Aumentar ventas en un 20%"
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        )}

        {/* Campo Público para Campañas y Copys */}
        {(activeTab === "campaign" || activeTab === "copy") && (
          <div className="form-group">
            <label htmlFor="audience">Público Objetivo</label>
            <input
              id="audience"
              type="text"
              name="audience"
              value={formData.audience || ""}
              placeholder="Ej: Jóvenes profesionales de 25-35 años"
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        )}

        {/* Campo Canal solo para Campañas */}
        {activeTab === "campaign" && (
          <div className="form-group">
            <label htmlFor="channel">Canal principal</label>
            <input
              id="channel"
              type="text"
              name="channel"
              value={formData.channel || ""}
              placeholder="Ej: Instagram, LinkedIn"
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        )}

        {/* País objetivo */}
        <div className="form-group">
          <label htmlFor="country">País objetivo <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
          <input
            id="country"
            type="text"
            name="country"
            value={formData.country || ""}
            placeholder="Ej: Colombia, México"
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Región específica */}
        <div className="form-group">
          <label htmlFor="region">Región específica <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
          <input
            id="region"
            type="text"
            name="region"
            value={formData.region || ""}
            placeholder="Ej: Medellín, Barranquilla"
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !formData.product}
        >
          {loading && (
            <svg className="pulse-element" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          )}
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}

export default CampaignForm;