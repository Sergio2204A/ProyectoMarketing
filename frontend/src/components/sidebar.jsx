import logo from "../assets/Softgic_Logo_White-scaled.png";

function Sidebar({ activeTab, setActiveTab }) {
  const nav = (id, label, icon) => (
    <li key={id} className={activeTab === id ? "active" : ""}>
      <a href={`#${id}`} onClick={(e) => { e.preventDefault(); setActiveTab(id); }}>
        {icon}<span>{label}</span>
      </a>
    </li>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-wrap">
        <img src={logo} alt="Softgic Logo" className="sidebar-logo-img" />
        <span className="sidebar-logo-text">Marketing AI</span>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-label">General</p>
        <ul className="sidebar-nav">
          {nav("dashboard", "Dashboard",
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          )}
        </ul>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-label">Generar</p>
        <ul className="sidebar-nav">
          {nav("campaign", "Campañas",
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          )}
          {nav("copy", "Copys",
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          )}
          {nav("hashtag", "Hashtags",
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
          )}
        </ul>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-label">Planificación</p>
        <ul className="sidebar-nav">
          {nav("calendar", "Calendario",
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          )}
          {nav("trends", "Tendencias",
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          )}
        </ul>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-label">Historial</p>
        <ul className="sidebar-nav">
          {nav("history", "Mis Creaciones",
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          )}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
