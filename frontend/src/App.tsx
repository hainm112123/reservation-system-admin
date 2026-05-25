import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminEventsPage from "./pages/AdminEventsPage";
import AdminVenuesPage from "./pages/AdminVenuesPage";
import AdminArtistsPage from "./pages/AdminArtistsPage";
import AdminEventSetupPage from "./pages/AdminEventSetupPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminRefundsPage from "./pages/AdminRefundsPage";

const AdminWorkspace: React.FC = () => {
  const { logout } = useAuth();
  const [page, setPage] = useState<string>("dashboard");
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <AdminDashboardPage setPage={setPage} />;
      case "events":
        return <AdminEventsPage setSelectedScheduleId={setSelectedScheduleId} setPage={setPage} />;
      case "venues":
        return <AdminVenuesPage />;
      case "artists":
        return <AdminArtistsPage />;
      case "setup":
        if (selectedScheduleId !== null) {
          return <AdminEventSetupPage scheduleId={selectedScheduleId} />;
        }
        setPage("events");
        return null;
      case "bookings":
        return <AdminBookingsPage />;
      case "refunds":
        return <AdminRefundsPage />;
      default:
        return <AdminDashboardPage setPage={setPage} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🎟️</div>
          <div className="brand-name">Control Desk</div>
        </div>

        <nav>
          <ul className="nav-list">
            <li>
              <div className={`nav-link ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>
                📊 Dashboard
              </div>
            </li>
            <li>
              <div className={`nav-link ${page === "events" || page === "setup" ? "active" : ""}`} onClick={() => setPage("events")}>
                🎟️ Events & Days
              </div>
            </li>
            <li>
              <div className={`nav-link ${page === "venues" ? "active" : ""}`} onClick={() => setPage("venues")}>
                🏛️ Venue Halls
              </div>
            </li>
            <li>
              <div className={`nav-link ${page === "artists" ? "active" : ""}`} onClick={() => setPage("artists")}>
                🎸 Roster Guests
              </div>
            </li>
            <li>
              <div className={`nav-link ${page === "bookings" ? "active" : ""}`} onClick={() => setPage("bookings")}>
                📈 Customer Orders
              </div>
            </li>
            <li>
              <div className={`nav-link ${page === "refunds" ? "active" : ""}`} onClick={() => setPage("refunds")}>
                💸 Refund Log
              </div>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Workspace Area */}
      <main className="workspace">{renderPage()}</main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { token } = useAuth();
  if (!token) {
    return <AdminLoginPage />;
  }
  return <AdminWorkspace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
