import "./Dashboard.css";

export default function Dashboard({ admin, onOpenVehicleForm, onLogout }) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-welcome">Welcome, {admin.name}</p>
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <button className="dashboard-logout-btn" onClick={onLogout}>
          Log Out
        </button>
      </header>

      <main className="dashboard-main">
        <button className="dashboard-card" onClick={onOpenVehicleForm}>
          <span className="dashboard-card-icon">🚚</span>
          <span className="dashboard-card-title">Vehicle Entry Form</span>
          <span className="dashboard-card-desc">
            Register and manage vehicle check-in details
          </span>
        </button>
      </main>
    </div>
  );
}
