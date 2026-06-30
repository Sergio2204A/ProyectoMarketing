import { useState } from "react";
import { forgotPasswordAPI } from "../services/authService";
import logo from "../assets/Softgic_Logo_White-scaled.png";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPasswordAPI(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo enviar el correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src={logo} alt="Softgic" style={styles.logoImg} />
          <span style={styles.logoSub}>Marketing AI</span>
        </div>

        <h2 style={styles.title}>Recuperar contraseña</h2>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
              Si el email <strong>{email}</strong> existe en nuestro sistema, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada (y spam).
            </p>
            <button onClick={onBackToLogin} className="btn-primary" style={{ width: "100%" }}>
              Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: "1.6", marginBottom: "0.25rem" }}>
              Escribe tu email y te enviaremos un enlace para crear una nueva contraseña.
            </p>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>

            <p style={styles.switchText}>
              <button type="button" onClick={onBackToLogin} style={styles.link}>
                ← Volver a iniciar sesión
              </button>
            </p>
          </form>
        )}
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
  switchText: { color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", marginTop: "1.5rem" },
  link: { background: "none", border: "none", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", padding: 0 },
};

export default ForgotPassword;
