import { useAuth } from "../context/AuthContext";

const TAB_TITLES = {
  dashboard: "Dashboard",
  campaign: "Generador de Campañas",
  copy: "Generador de Copys",
  hashtag: "Generador de Hashtags",
  calendar: "Calendario de Contenidos",
  trends: "Tendencias de Marketing",
  history: "Historial",
};

function Header({ activeTab }) {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="top-header">
      <div className="top-header-left">
        <span className="top-header-section">{TAB_TITLES[activeTab] || "Dashboard"}</span>
      </div>
      <div className="top-header-right">
        <div className="top-header-user">
          <div className="user-avatar">{initials}</div>
          <span className="user-name">{user?.name}</span>
        </div>
        <button className="header-logout-btn" onClick={logout} title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </header>
  );
}

export default Header;
