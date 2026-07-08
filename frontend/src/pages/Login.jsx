import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Softgic_Logo_White-scaled.png";

function Login({ onSwitchToRegister, onForgotPassword }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSlowLoading(false);
    const slowTimer = setTimeout(() => setSlowLoading(true), 4000);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || "Credenciales incorrectas");
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src={logo} alt="Softgic" style={styles.logoImg} />
          <span style={styles.logoSub}>Marketing AI</span>
        </div>

        <h2 style={styles.title}>Iniciar sesión</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {slowLoading && (
            <p style={styles.hint}>⏳ El servidor estaba inactivo y está despertando, puede tardar unos segundos más...</p>
          )}

          <p style={{ ...styles.switchText, marginTop: "0.25rem" }}>
            <button type="button" onClick={onForgotPassword} style={styles.link}>
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        </form>

        <p style={styles.switchText}>
          ¿No tienes cuenta?{" "}
          <button onClick={onSwitchToRegister} style={styles.link}>
            Regístrate gratis
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)" },
  card: { backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-lg)", padding: "2.5rem", width: "100%", maxWidth: "420px" },
  logoWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", marginBottom: "2rem" },
  logoImg: { width: "150px", height: "auto", objectFit: "contain" },
  logoSub: { fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" },
  title: { color: "var(--text-active)", fontSize: "1.4rem", fontWeight: "700", marginBottom: "1.5rem", textAlign: "center", letterSpacing: "-0.02em" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.07em" },
  input: { backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "0.75rem 1rem", color: "var(--text-active)", fontSize: "0.95rem", outline: "none" },
  error: { color: "#f87171", fontSize: "0.85rem", textAlign: "center" },
  hint: { color: "var(--text-muted)", fontSize: "0.78rem", textAlign: "center", marginTop: "0.25rem" },
  switchText: { color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", marginTop: "1.5rem" },
  link: { background: "none", border: "none", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", padding: 0 },
};

export default Login;
