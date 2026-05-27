import React, { useEffect, useState } from "react";
import { getRefunds, triggerManualRefund } from "../api/admin";
import type { Refund } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export const AdminRefundsPage: React.FC = () => {
  const { token } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const loadRefunds = async () => {
    if (!token) return;
    try {
      const res = await getRefunds(token);
      setRefunds(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void loadRefunds();
  }, [token]);

  const handleManualRefund = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setShowConfirmModal(true);
  };

  const handleConfirmRefund = async () => {
    if (!token || selectedBookingId === null) return;
    setShowConfirmModal(false);
    setError(null);
    setMessage(null);
    try {
      const res = await triggerManualRefund(selectedBookingId, token);
      setMessage(res.message);
      void loadRefunds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manual refund failed");
    } finally {
      setSelectedBookingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="header-title">Refund Allocations Manager</h1>
        <p className="header-desc">Monitor transactions flagged for refunding due to event cancellations and process retries.</p>
      </div>

      {message && <div className="alert-box alert-success">{message}</div>}
      {error && <div className="alert-box alert-warning">{error}</div>}

      <section className="panel">
        <h2>Active Refund Log Queue</h2>
        {refunds.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "0.95rem" }}>
            No refund actions pending or processed at this time.
          </p>
        ) : (
          <div className="table-container" style={{ marginTop: "1rem" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Gateway Ref</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((r) => (
                  <tr key={r.refund_id}>
                    <td>#{r.booking_id}</td>
                    <td style={{ fontStyle: "italic" }}>{r.gateway_refund_id || "N/A"}</td>
                    <td style={{ fontWeight: 700, color: "var(--danger)" }}>${Number(r.amount).toLocaleString()}</td>
                    <td>{r.reason}</td>
                    <td>
                      <span className={`badge ${r.status === "SUCCESS" ? "badge-active" : r.status === "FAILED" ? "badge-cancelled" : "badge-warning"}`}>
                        {r.status === "SUCCESS" ? "Refunded" : r.status === "FAILED" ? "Failed" : "Refunding"}
                      </span>
                    </td>
                    <td>
                      {r.status !== "SUCCESS" ? (
                        <button className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => void handleManualRefund(r.booking_id)}>
                          Retry Refund
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showConfirmModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div className="panel" style={{
            width: "100%",
            maxWidth: "450px",
            padding: "2rem",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), var(--border-glow)",
            backgroundColor: "var(--bg-card)",
          }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-primary)" }}>Confirm Manual Refund</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              Are you sure you want to resolve booking <strong style={{ color: "var(--primary)" }}>#{selectedBookingId}</strong> manually? This will update its status to Refunded.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button 
                className="btn" 
                style={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.05)", 
                  color: "var(--text-primary)", 
                  border: "1px solid var(--border-color)",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "8px",
                  cursor: "pointer"
                }} 
                onClick={() => { setShowConfirmModal(false); setSelectedBookingId(null); }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ 
                  padding: "0.5rem 1.2rem",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
                onClick={() => void handleConfirmRefund()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminRefundsPage;
