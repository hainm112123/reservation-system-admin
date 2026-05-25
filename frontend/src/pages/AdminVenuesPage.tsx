import React, { useEffect, useState } from "react";
import { getVenues, createVenue, updateVenue, deleteVenue } from "../api/admin";
import type { Venue } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export const AdminVenuesPage: React.FC = () => {
  const { token } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [capacity, setCapacity] = useState<number>(100);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadVenues = async () => {
    if (!token) return;
    try {
      const res = await getVenues(token);
      setVenues(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void loadVenues();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setMessage(null);

    if (!venueName || !city || capacity <= 0) {
      setError("Please input a valid name, city, and capacity (> 0).");
      return;
    }

    try {
      if (editingId) {
        await updateVenue(editingId, { venue_name: venueName, city, capacity }, token);
        setMessage("Venue updated successfully!");
      } else {
        await createVenue({ venue_name: venueName, city, capacity }, token);
        setMessage("Venue created successfully!");
      }
      setVenueName("");
      setCity("");
      setCapacity(100);
      setEditingId(null);
      void loadVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleEdit = (v: Venue) => {
    setEditingId(v.venue_id);
    setVenueName(v.venue_name);
    setCity(v.city);
    setCapacity(v.capacity);
  };

  const handleDelete = async (venueId: number) => {
    if (!token || !window.confirm("Are you sure you want to delete this venue?")) return;
    try {
      await deleteVenue(venueId, token);
      setMessage("Venue deleted!");
      void loadVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="header-title">Venue Management</h1>
        <p className="header-desc">Manage your halls, stadiums, concert halls, and capacity settings.</p>
      </div>

      {message && <div className="alert-box alert-success">{message}</div>}
      {error && <div className="alert-box alert-warning">{error}</div>}

      <div className="grid-cols-2">
        <section className="panel">
          <h2>{editingId ? "Edit Venue" : "Create New Venue"}</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label>Venue Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Grand Arena"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Overall Capacity</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Save Changes" : "Create Venue"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setVenueName("");
                    setCity("");
                    setCapacity(100);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Active Venue Locations</h2>
          <div className="table-container" style={{ marginTop: "1rem" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.venue_id}>
                    <td style={{ fontWeight: 600 }}>{v.venue_name}</td>
                    <td>{v.city}</td>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>{v.capacity.toLocaleString()} seats</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => handleEdit(v)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => void handleDelete(v.venue_id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
export default AdminVenuesPage;
