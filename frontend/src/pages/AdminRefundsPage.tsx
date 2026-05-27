import React, { useEffect, useState } from "react";
import { getRefunds, triggerManualRefund } from "../api/admin";
import type { Refund } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export const AdminRefundsPage: React.FC = () => {
  const { token } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleManualRefund = async (bookingId: number) => {
    if (!token || !window.confirm("Resolve this refund manually?")) return;
    setError(null);
    setMessage(null);
    try {
      const res = await triggerManualRefund(bookingId, token);
      setMessage(res.message);
      void loadRefunds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manual refund failed");
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
    </div>
  );
};
export default AdminRefundsPage;
