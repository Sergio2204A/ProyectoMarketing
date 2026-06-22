import { useState } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function AppContent() {
  const { user } = useAuth();
  const [authView, setAuthView] = useState("login");

  if (!user) {
    if (authView === "register") return <Register onSwitchToLogin={() => setAuthView("login")} />;
    return <Login onSwitchToRegister={() => setAuthView("register")} />;
  }

  return <Home />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
