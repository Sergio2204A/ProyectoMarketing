import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { updateProfile } from "../services/authService";

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
  const { user, token, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [form, setForm] = useState({ name: "", password: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) {
      showToast("Las contraseñas no coinciden", "error"); return;
    }
    setSaving(true);
    try {
      const payload = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.password) payload.password = form.password;
      if (!Object.keys(payload).length) { showToast("No hay cambios para guardar", "info"); setSaving(false); return; }
      const data = await updateProfile(token, payload);
      updateUser(data.user);
      showToast("Perfil actualizado ✓", "success");
      setForm({ name: "", password: "", confirm: "" });
      setShowProfile(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Error al actualizar perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="top-header">
        <div className="top-header-left">
          <span className="top-header-section">{TAB_TITLES[activeTab] || "Dashboard"}</span>
        </div>
        <div className="top-header-right">
          <button className="top-header-user" onClick={() => setShowProfile(true)} title="Editar perfil"
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.25rem 0.5rem", borderRadius: "var(--border-radius-sm)", transition: "background 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{user?.name}</span>
          </button>
          <button className="header-logout-btn" onClick={toggleTheme} title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button className="header-logout-btn" onClick={logout} title="Cerrar sesión">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {showProfile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowProfile(false)}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", padding: "2rem", width: "100%", maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
              <div className="user-avatar" style={{ width: "48px", height: "48px", fontSize: "1.1rem" }}>{initials}</div>
              <div>
                <div style={{ fontWeight: "700", color: "var(--text-active)", fontSize: "1rem" }}>{user?.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user?.email}</div>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.4rem" }}>
                  Nuevo nombre
                </label>
                <input type="text" placeholder={user?.name} value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  style={{ width: "100%", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.7rem 1rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.4rem" }}>
                  Nueva contraseña
                </label>
                <input type="password" placeholder="Dejar en blanco para no cambiar" value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  style={{ width: "100%", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.7rem 1rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none" }} />
              </div>
              {form.password && (
                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: "0.4rem" }}>
                    Confirmar contraseña
                  </label>
                  <input type="password" placeholder="Repite la contraseña" value={form.confirm}
                    onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                    style={{ width: "100%", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.7rem 1rem", color: "var(--text-active)", fontSize: "0.875rem", outline: "none" }} />
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowProfile(false)}
                  style={{ padding: "0.65rem 1.2rem", background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.875rem" }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "0.65rem 1.4rem" }}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
