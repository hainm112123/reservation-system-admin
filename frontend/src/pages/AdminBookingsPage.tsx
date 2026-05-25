import React, { useEffect, useState } from "react";
import { getBookings, getBooking, triggerManualRefund } from "../api/admin";
import type { Booking } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export const AdminBookingsPage: React.FC = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!token) return;
    try {
      const res = await getBookings(token);
      setBookings(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, [token]);

  const handleViewDetails = async (bookingId: number) => {
    if (!token) return;
    setError(null);
    try {
      const detail = await getBooking(bookingId, token);
      setSelectedBooking(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load detail failed");
    }
  };

  const handleManualRefund = async (bookingId: number) => {
    if (!token || !window.confirm("Manually refund this booking? Status will be updated to REFUNDED.")) return;
    setError(null);
    setMessage(null);
    try {
      const res = await triggerManualRefund(bookingId, token);
      setMessage(res.message);
      
      // Update local view
      if (selectedBooking && selectedBooking.booking_id === bookingId) {
        setSelectedBooking((prev) => prev ? { ...prev, booking_status: "REFUNDED" } : null);
      }
      void loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manual refund failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="header-title">Booking Monitoring Panel</h1>
        <p className="header-desc">Track ticket purchases, view seat details, and resolve order refunds.</p>
      </div>

      {message && <div className="alert-box alert-success">{message}</div>}
      {error && <div className="alert-box alert-warning">{error}</div>}

      <div className="grid-cols-2" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Bookings List */}
        <section className="panel">
          <h2>All Customer Orders ({bookings.length})</h2>
          <div className="table-container" style={{ marginTop: "1rem" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.booking_id}>
                    <td>#{b.booking_id}</td>
                    <td style={{ fontWeight: 600 }}>{b.customer_name}</td>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>${Number(b.total_amount).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${b.booking_status === "PAID" ? "badge-active" : b.booking_status === "PENDING_PAYMENT" ? "badge-warning" : "badge-cancelled"}`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => void handleViewDetails(b.booking_id)}>
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Inspector Drawer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {selectedBooking ? (
            <section className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2>Order Details #{selectedBooking.booking_id}</h2>
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div><strong>Customer:</strong> {selectedBooking.customer_name}</div>
                <div><strong>Phone:</strong> {selectedBooking.phone}</div>
                <div><strong>Email:</strong> {selectedBooking.email}</div>
                <div><strong>Refund Account:</strong> {selectedBooking.payment_account || "Not provided"}</div>
                <div><strong>Current Status:</strong> <span className={`badge ${selectedBooking.booking_status === "PAID" ? "badge-active" : selectedBooking.booking_status === "PENDING_PAYMENT" ? "badge-warning" : "badge-cancelled"}`}>{selectedBooking.booking_status}</span></div>
                <div><strong>Amount:</strong> <strong style={{ color: "var(--success)" }}>${Number(selectedBooking.total_amount).toLocaleString()}</strong></div>
              </div>

              <h3>Assigned Grid Seats ({selectedBooking.e_tickets?.length || 0})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
                {selectedBooking.e_tickets && selectedBooking.e_tickets.length > 0 ? (
                  selectedBooking.e_tickets.map((t) => (
                    <div key={t.ticket_id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "0.5rem", borderRadius: "6px", fontSize: "0.85rem" }}>
                      <span>💺 Row {t.row_label} - Col {t.col_number}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{t.ticket_code}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No physical seat coordinates associated with this order.</p>
                )}
              </div>

              {selectedBooking.booking_status === "REFUNDING" && (
                <button className="btn btn-danger" style={{ width: "100%", marginTop: "1rem" }} onClick={() => void handleManualRefund(selectedBooking.booking_id)}>
                  Process Manual Refund
                </button>
              )}
            </section>
          ) : (
            <div className="panel" style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
              <h3>Inspect Order</h3>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Click "Inspect" on any order from the left table to load comprehensive seat allocations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminBookingsPage;
