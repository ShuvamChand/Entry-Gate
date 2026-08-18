import { useState } from "react";
import LoginPage from "./component/LoginPage/LoginPage";
import Dashboard from "./component/Dashboard/Dashboard";
import VehicleEntryForm from "./component/Form/VehicleEntryForm";

function App() {
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);
  const [view, setView] = useState("dashboard"); // "dashboard" | "vehicleForm"

  const handleLogin = (admin) => {
    setLoggedInAdmin(admin);
    setView("dashboard");
  };

  const handleLogout = () => {
    setLoggedInAdmin(null);
    setView("dashboard");
  };

  if (!loggedInAdmin) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (view === "vehicleForm") {
    return (
      <div>
        <div style={{ padding: "16px 32px 0" }}>
          <button
            onClick={() => setView("dashboard")}
            style={{
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              color: "#374151",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
        <VehicleEntryForm />
      </div>
    );
  }

  return (
    <Dashboard
      admin={loggedInAdmin}
      onOpenVehicleForm={() => setView("vehicleForm")}
      onLogout={handleLogout}
    />
  );
}

export default App;
