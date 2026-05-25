import React, { useEffect, useState } from "react";
import { getEvents, getVenues, getArtists, getBookings } from "../api/admin";
import type { Event, Venue, Artist, Booking } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export const AdminDashboardPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { token, username } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [evt, ven, art, bkg] = await Promise.all([
          getEvents(token),
          getVenues(token),
          getArtists(token),
          getBookings(token),
        ]);
        setEvents(evt);
        setVenues(ven);
        setArtists(art);
        setBookings(bkg);
      } catch (err) {
        console.error("Dashboard failed to load metrics: ", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [token]);

  const activeEventsCount = events.filter((e) => e.status === "ACTIVE").length;
  const totalRevenue = bookings
    .filter((b) => b.booking_status === "PAID")
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  if (loading) {
    return <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "4rem" }}>Loading dashboard insights...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="header-title">Welcome back, {username}!</h1>
        <p className="header-desc">Antigravity Event Booking Control Center</p>
      </div>

      <div className="grid-cols-4">
        <div className="panel stat-card">
          <div className="stat-icon">🎉</div>
          <div>
            <div className="stat-val">{events.length}</div>
            <div className="stat-lbl">Total Events ({activeEventsCount} Active)</div>
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon" style={{ color: "var(--secondary)", background: "rgba(139, 92, 246, 0.1)", borderColor: "rgba(139, 92, 246, 0.2)" }}>🏛️</div>
          <div>
            <div className="stat-val">{venues.length}</div>
            <div className="stat-lbl">Active Venues</div>
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon" style={{ color: "var(--warning)", background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)" }}>🎸</div>
          <div>
            <div className="stat-val">{artists.length}</div>
            <div className="stat-lbl">Roster Artists</div>
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-icon" style={{ color: "var(--success)", background: "var(--success-glow)", borderColor: "rgba(16, 185, 129, 0.2)" }}>💰</div>
          <div>
            <div className="stat-val">${totalRevenue.toLocaleString()}</div>
            <div className="stat-lbl">Total Revenue</div>
          </div>
        </div>
      </div>

      <div className="grid-cols-2">
        <section className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2>Quick Actions</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Easily jump to different modules to configure event configurations, seat maps, and manage artists.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button className="btn btn-primary" onClick={() => setPage("events")}>
              Manage Events & schedules
            </button>
            <button className="btn btn-secondary" onClick={() => setPage("venues")}>
              Manage Venues
            </button>
            <button className="btn btn-secondary" onClick={() => setPage("artists")}>
              Coordinate Artists
            </button>
          </div>
        </section>

        <section className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2>Recent Orders</h2>
          {bookings.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>No tickets purchased yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 4).map((b) => (
                    <tr key={b.booking_id}>
                      <td style={{ fontWeight: 600 }}>{b.customer_name}</td>
                      <td>${Number(b.total_amount).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${b.booking_status === "PAID" ? "badge-active" : b.booking_status === "PENDING_PAYMENT" ? "badge-warning" : "badge-cancelled"}`}>
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
export default AdminDashboardPage;
