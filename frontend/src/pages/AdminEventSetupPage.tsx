import React, { useEffect, useState } from "react";
import { getSchedule, getVenues, getTicketConfigs, createTicketConfig, deleteTicketConfig, getSeatLayout, saveSeatLayout } from "../api/admin";
import type { Venue, TicketConfig, EventSchedule } from "../api/admin";
import { useAuth } from "../context/AuthContext";

interface SetupPageProps {
  scheduleId: number;
}

interface SeatDesign {
  row_label: string;
  col_number: number;
  seat_type: string; // 'normal', 'special', 'vip'
}

export const AdminEventSetupPage: React.FC<SetupPageProps> = ({ scheduleId }) => {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState<EventSchedule | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  
  // Ticket configs
  const [configs, setConfigs] = useState<TicketConfig[]>([]);
  const [ticketType, setTicketType] = useState("normal");
  const [price, setPrice] = useState<number>(0);
  const [maxQty, setMaxQty] = useState<number>(1);
  
  // Visual Seat Grid Layout
  const [seats, setSeats] = useState<SeatDesign[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("normal"); // 'empty', 'normal', 'special', 'vip'

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Constants for row and columns matching A-J and 1-18
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const cols = Array.from({ length: 18 }, (_, i) => i + 1);

  const loadData = async () => {
    if (!token || !scheduleId) return;
    try {
      const sched = await getSchedule(scheduleId, token);
      setSchedule(sched);
      
      const [vens, tconfigs, seatMap] = await Promise.all([
        getVenues(token),
        getTicketConfigs(scheduleId, token),
        getSeatLayout(scheduleId, token)
      ]);
      
      const v = vens.find((vn) => vn.venue_id === sched.venue_id);
      if (v) setVenue(v);
      setConfigs(tconfigs);
      setSeats(seatMap.seats || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load ticketing configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [scheduleId, token]);

  const handleAddConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !schedule) return;
    setError(null);
    setMessage(null);

    if (price < 0 || maxQty <= 0) {
      setError("Please input a valid price (>= 0) and quantity (> 0).");
      return;
    }

    try {
      await createTicketConfig({
        schedule_id: scheduleId,
        ticket_type: ticketType,
        price,
        max_quantity: maxQty
      }, token);
      
      setMessage("Ticket configuration added successfully!");
      setPrice(0);
      setMaxQty(1);
      
      const tconfigs = await getTicketConfigs(scheduleId, token);
      setConfigs(tconfigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Config creation failed");
    }
  };

  const handleDeleteConfig = async (configId: number) => {
    if (!token || !window.confirm("Remove this ticket config?")) return;
    try {
      await deleteTicketConfig(configId, token);
      setMessage("Ticket configuration removed.");
      const tconfigs = await getTicketConfigs(scheduleId, token);
      setConfigs(tconfigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  // Seat designer handlers
  const getSeatAt = (row: string, col: number): SeatDesign | undefined => {
    return seats.find((s) => s.row_label === row && s.col_number === col);
  };

  const handleCellClick = (row: string, col: number) => {
    const existing = getSeatAt(row, col);
    let updatedSeats = [...seats];

    if (selectedTool === "empty") {
      // Remove seat design
      updatedSeats = updatedSeats.filter((s) => !(s.row_label === row && s.col_number === col));
    } else {
      if (existing) {
        // Edit seat type
        existing.seat_type = selectedTool;
      } else {
        // Add new seat design
        updatedSeats.push({
          row_label: row,
          col_number: col,
          seat_type: selectedTool
        });
      }
    }
    setSeats(updatedSeats);
  };

  const handleSaveLayout = async () => {
    if (!token || !schedule) return;
    setError(null);
    setMessage(null);

    const totalDesigned = seats.length;
    if (venue && totalDesigned > venue.capacity) {
      setError(`Overcapacity error: Designed seats (${totalDesigned}) exceed venue capacity (${venue.capacity})!`);
      return;
    }

    // Check pricing configs are present for normal, special, vip seats configured in grid
    const designedTypes = new Set(seats.map(s => s.seat_type.toLowerCase()));
    const configuredTypes = new Set(configs.map(c => c.ticket_type.toLowerCase()));

    for (const dtype of designedTypes) {
      if (!configuredTypes.has(dtype)) {
        setError(`Please configure ticket pricing for '${dtype}' seat type in the ticket configuration list first.`);
        return;
      }
    }

    try {
      const res = await saveSeatLayout(scheduleId, seats, token);
      setMessage(res.message || "Seat grid layout saved and physical tickets pre-generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving layout failed.");
    }
  };

  const clearLayout = () => {
    if (window.confirm("Are you sure you want to clear all designed seats?")) {
      setSeats([]);
    }
  };

  const fillLayout = () => {
    if (!window.confirm("Fill the entire grid layout with Normal seats?")) return;
    const filled: SeatDesign[] = [];
    rows.forEach((r) => {
      cols.forEach((c) => {
        filled.push({
          row_label: r,
          col_number: c,
          seat_type: "normal"
        });
      });
    });
    setSeats(filled);
  };

  if (loading) {
    return <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "4rem" }}>Loading ticketing configurations...</div>;
  }

  const capacityVal = venue?.capacity || 0;
  const designedCount = seats.length;
  const capacityPercent = Math.min((designedCount / (capacityVal || 1)) * 100, 100);
  const totalConfiguredQty = configs.reduce((sum, c) => sum + c.max_quantity, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="header-title">Ticketing & Seat Map designer</h1>
        <p className="header-desc">
          Configure ticket types, set pricing rates, and map the visual seat floorplan for <strong>{venue?.venue_name}</strong>.
        </p>
      </div>

      {message && <div className="alert-box alert-success">{message}</div>}
      {error && <div className="alert-box alert-warning">{error}</div>}

      <div className="grid-cols-2" style={{ gridTemplateColumns: "1fr 2fr" }}>
        {/* Left Column: Ticket Configs list & pricing form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <section className="panel">
            <h2>Add Ticket Configuration</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Configure ticket prices for normal, special, and VIP guest seats.
            </p>
            <form onSubmit={handleAddConfig} style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label>Ticket Type</label>
                <select className="form-control" value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                  <option value="normal">Normal (Standard seats)</option>
                  <option value="special">Special (Premium/Reserved)</option>
                  <option value="vip">VIP (External invites, not bookable)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ticket Price ($)</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Max Quantity</label>
                <input
                  type="number"
                  min={1}
                  className="form-control"
                  value={maxQty}
                  onChange={(e) => setMaxQty(Number(e.target.value))}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                Add Configuration
              </button>
            </form>
          </section>

          <section className="panel">
            <h2>Pricing Configs ({configs.length})</h2>
            <div className="table-container" style={{ marginTop: "1rem" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Qty Limit</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((c) => (
                    <tr key={c.config_id}>
                      <td style={{ fontWeight: 600, textTransform: "capitalize" }}>{c.ticket_type}</td>
                      <td style={{ color: "var(--success)", fontWeight: 700 }}>${c.price}</td>
                      <td>{c.max_quantity}</td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }} onClick={() => void handleDeleteConfig(c.config_id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Total Allocated Qty: <strong style={{ color: "var(--text-primary)" }}>{totalConfiguredQty}</strong> / {capacityVal} seats
            </div>
          </section>
        </div>

        {/* Right Column: Visual Seat Map Board Grid */}
        <section className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>Seat Grid Map Designer</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                Interactive grid floorplan representing rows A-J and columns 1-18.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={fillLayout}>
                Fill All
              </button>
              <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={clearLayout}>
                Clear All
              </button>
            </div>
          </div>

          {/* Interactive Capacity progress tracker */}
          <div className="capacity-status-bar">
            <div className="capacity-status-text">
              <span>Designed Seats Allocation</span>
              <span>
                <strong>{designedCount}</strong> / {capacityVal} seats ({capacityPercent.toFixed(0)}%)
              </span>
            </div>
            <div className="capacity-progress-bg">
              <div
                className={`capacity-progress-fill ${designedCount > capacityVal ? "exceeded" : ""}`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>

          {/* Tool Selection Buttons */}
          <div className="tool-selection" style={{ marginTop: "1rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, display: "flex", alignItems: "center", color: "var(--text-secondary)", marginRight: "0.5rem" }}>
              Brush Tool:
            </span>
            <button className={`tool-btn tool-normal ${selectedTool === "normal" ? "active-tool" : ""}`} onClick={() => setSelectedTool("normal")}>
              <span className="legend-box" style={{ background: "var(--primary)", width: "12px", height: "12px" }} /> Normal
            </button>
            <button className={`tool-btn tool-special ${selectedTool === "special" ? "active-tool" : ""}`} onClick={() => setSelectedTool("special")}>
              <span className="legend-box" style={{ background: "var(--secondary)", width: "12px", height: "12px" }} /> Special
            </button>
            <button className={`tool-btn tool-vip ${selectedTool === "vip" ? "active-tool" : ""}`} onClick={() => setSelectedTool("vip")}>
              <span className="legend-box" style={{ background: "var(--warning)", width: "12px", height: "12px" }} /> VIP (Invite Only)
            </button>
            <button className={`tool-btn tool-empty ${selectedTool === "empty" ? "active-tool" : ""}`} onClick={() => setSelectedTool("empty")}>
              <span className="legend-box" style={{ border: "1.5px dashed var(--text-muted)", background: "none", width: "12px", height: "12px" }} /> Eraser
            </button>
          </div>

          {/* Visual Seat Map Board Grid */}
          <div className="seat-map-grid-wrapper">
            <div className="seat-map-board">
              {/* Header column indicators */}
              <div />
              {cols.map((c) => (
                <div key={`header-col-${c}`} className="column-indicator">
                  {c}
                </div>
              ))}

              {/* Rows */}
              {rows.map((r) => (
                <React.Fragment key={`grid-row-${r}`}>
                  {/* Row indicator at left */}
                  <div className="row-indicator">{r}</div>
                  
                  {/* Seat columns */}
                  {cols.map((c) => {
                    const seat = getSeatAt(r, c);
                    let seatClass = "seat-empty";
                    if (seat?.seat_type === "normal") seatClass = "seat-normal";
                    else if (seat?.seat_type === "special") seatClass = "seat-special";
                    else if (seat?.seat_type === "vip") seatClass = "seat-vip";

                    return (
                      <div
                        key={`seat-${r}-${c}`}
                        className={`seat-node ${seatClass}`}
                        onClick={() => handleCellClick(r, c)}
                      >
                        <span className="seat-label-row-col">{r}{c}</span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }} onClick={handleSaveLayout}>
              Save Seat Layout & Pregenerate Tickets 🚀
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
export default AdminEventSetupPage;
