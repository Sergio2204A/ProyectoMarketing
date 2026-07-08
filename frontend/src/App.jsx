import { useState, useEffect } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { pingServer } from "./services/authService";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function AppContent() {
  const { user } = useAuth();
  const urlResetToken = new URLSearchParams(window.location.search).get("resetToken");
  const [authView, setAuthView] = useState(urlResetToken ? "reset" : "login");

  /* El backend gratuito "duerme" tras inactividad — lo despertamos apenas carga la página
     para que, cuando la persona termine de escribir sus credenciales, ya esté listo */
  useEffect(() => { pingServer(); }, []);

  const backToLogin = () => {
    if (urlResetToken) window.history.replaceState({}, "", window.location.pathname);
    setAuthView("login");
  };

  if (!user) {
    if (authView === "register") return <Register onSwitchToLogin={() => setAuthView("login")} />;
    if (authView === "forgot") return <ForgotPassword onBackToLogin={() => setAuthView("login")} />;
    if (authView === "reset") return <ResetPassword token={urlResetToken} onDone={backToLogin} />;
    return <Login onSwitchToRegister={() => setAuthView("register")} onForgotPassword={() => setAuthView("forgot")} />;
  }

  return <Home />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
