import React, { useEffect, useState } from "react";
import { getArtists, createArtist, deleteArtist, getEvents, getSchedules, getEventDays, getEventArtists, assignArtist, unassignArtist, validateBackups } from "../api/admin";
import type { Artist, Event, EventSchedule, EventDay, EventArtist } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export const AdminArtistsPage: React.FC = () => {
  const { token } = useAuth();
  
  // Roster CRUD
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistName, setArtistName] = useState("");
  
  // Selection
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvtId, setSelectedEvtId] = useState<number>(0);
  
  const [schedules, setSchedules] = useState<EventSchedule[]>([]);
  const [selectedSchedId, setSelectedSchedId] = useState<number>(0);
  
  const [days, setDays] = useState<EventDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<number>(0);
  
  // Assigned Artists & Backups Validation
  const [dayArtists, setDayArtists] = useState<EventArtist[]>([]);
  const [backupValid, setBackupValid] = useState(true);
  const [backupWarning, setBackupWarning] = useState<string | null>(null);

  // Assignment form
  const [targetArtistId, setTargetArtistId] = useState<number>(0);
  const [isBackup, setIsBackup] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadArtistsAndEvents = async () => {
    if (!token) return;
    try {
      const [art, evts] = await Promise.all([getArtists(token), getEvents(token)]);
      setArtists(art);
      setEvents(evts);
      if (art.length > 0) setTargetArtistId(art[0].artist_id);
      if (evts.length > 0) setSelectedEvtId(evts[0].event_id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void loadArtistsAndEvents();
  }, [token]);

  // Load schedules when event changes
  useEffect(() => {
    async function loadSchedules() {
      if (!token || !selectedEvtId) return;
      try {
        const res = await getSchedules(selectedEvtId, token);
        setSchedules(res);
        if (res.length > 0) {
          setSelectedSchedId(res[0].schedule_id);
        } else {
          setSchedules([]);
          setSelectedSchedId(0);
          setDays([]);
          setSelectedDayId(0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    void loadSchedules();
  }, [selectedEvtId, token]);

  // Load days when schedule changes
  useEffect(() => {
    async function loadDays() {
      if (!token || !selectedSchedId) return;
      try {
        const res = await getEventDays(selectedSchedId, token);
        setDays(res);
        if (res.length > 0) {
          setSelectedDayId(res[0].event_day_id);
        } else {
          setDays([]);
          setSelectedDayId(0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    void loadDays();
  }, [selectedSchedId, token]);

  // Load assigned artists & validation when event day changes
  const loadDayArtists = async () => {
    if (!token || !selectedDayId) return;
    try {
      const arts = await getEventArtists(selectedDayId, token);
      setDayArtists(arts);
      
      const check = await validateBackups(selectedDayId, token);
      setBackupValid(check.valid);
      setBackupWarning(check.warning || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedDayId) {
      void loadDayArtists();
    } else {
      setDayArtists([]);
      setBackupValid(true);
      setBackupWarning(null);
    }
  }, [selectedDayId, token]);

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setMessage(null);

    if (!artistName) {
      setError("Artist name is required.");
      return;
    }

    try {
      await createArtist({ artist_name: artistName }, token);
      setMessage("Artist created successfully!");
      setArtistName("");
      const art = await getArtists(token);
      setArtists(art);
      if (art.length > 0) setTargetArtistId(art[0].artist_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create artist failed");
    }
  };

  const handleDeleteArtist = async (artistId: number) => {
    if (!token || !window.confirm("Are you sure you want to delete this artist?")) return;
    try {
      await deleteArtist(artistId, token);
      setMessage("Artist deleted.");
      const art = await getArtists(token);
      setArtists(art);
      if (art.length > 0) setTargetArtistId(art[0].artist_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleAssignArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedDayId || !targetArtistId) return;
    setError(null);
    setMessage(null);

    try {
      await assignArtist({
        event_day_id: selectedDayId,
        artist_id: targetArtistId,
        is_backup: isBackup
      }, token);
      setMessage("Artist assigned to date successfully!");
      setIsBackup(false);
      void loadDayArtists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment failed");
    }
  };

  const handleUnassignArtist = async (artistId: number) => {
    if (!token || !selectedDayId) return;
    try {
      const res = await unassignArtist(selectedDayId, artistId, token);
      setMessage(res.message);
      void loadDayArtists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unassignment failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="header-title">Artist Coordinator Desk</h1>
        <p className="header-desc">Manage the artist roster and schedule guests or backups for specific dates.</p>
      </div>

      {message && <div className="alert-box alert-success">{message}</div>}
      {error && <div className="alert-box alert-warning">{error}</div>}

      <div className="grid-cols-2">
        {/* Left: Artists CRUD */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <section className="panel">
            <h2>Add Artist to Roster</h2>
            <form onSubmit={handleArtistSubmit} style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <div className="form-group" style={{ margin: 0, flexGrow: 1 }}>
                <label>Artist Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. DJ Alok"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Artist
              </button>
            </form>
          </section>

          <section className="panel">
            <h2>Artist Roster ({artists.length})</h2>
            <div className="table-container" style={{ marginTop: "1rem" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Artist Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map((a) => (
                    <tr key={a.artist_id}>
                      <td style={{ fontWeight: 600 }}>🎸 {a.artist_name}</td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={() => void handleDeleteArtist(a.artist_id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Date Artist Coordination */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <section className="panel">
            <h2>Select Day Schedule</h2>
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>1. Select Event</label>
                <select className="form-control" value={selectedEvtId} onChange={(e) => setSelectedEvtId(Number(e.target.value))}>
                  {events.map((e) => (
                    <option key={e.event_id} value={e.event_id}>
                      {e.event_name}
                    </option>
                  ))}
                </select>
              </div>

              {schedules.length > 0 && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label>2. Select Venue Schedule</label>
                  <select className="form-control" value={selectedSchedId} onChange={(e) => setSelectedSchedId(Number(e.target.value))}>
                    {schedules.map((s) => (
                      <option key={s.schedule_id} value={s.schedule_id}>
                        Schedule #{s.schedule_id} (Venue #{s.venue_id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {days.length > 0 && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label>3. Select Day Date</label>
                  <select className="form-control" value={selectedDayId} onChange={(e) => setSelectedDayId(Number(e.target.value))}>
                    {days.map((d) => (
                      <option key={d.event_day_id} value={d.event_day_id}>
                        📅 {new Date(d.date).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          {selectedDayId ? (
            <>
              {/* Backups alert banner */}
              {!backupValid && backupWarning && (
                <div className="alert-box alert-warning" style={{ fontSize: "0.95rem" }}>
                  ⚠️ <strong>Backups Alert:</strong> {backupWarning}
                </div>
              )}

              {/* Day Assignments Form */}
              <section className="panel">
                <h2>Assign Artist to this Day</h2>
                <form onSubmit={handleAssignArtist} style={{ marginTop: "1rem" }}>
                  <div className="form-group">
                    <label>Choose Artist</label>
                    <select className="form-control" value={targetArtistId} onChange={(e) => setTargetArtistId(Number(e.target.value))}>
                      {artists.map((a) => (
                        <option key={a.artist_id} value={a.artist_id}>
                          {a.artist_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="checkbox-row" style={{ marginTop: "1rem" }}>
                    <input type="checkbox" checked={isBackup} onChange={(e) => setIsBackup(e.target.checked)} />
                    Backup Artist (Assign as backup guest)
                  </label>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1.25rem" }}>
                    Assign Artist to Day
                  </button>
                </form>
              </section>

              {/* Day artists list */}
              <section className="panel">
                <h2>Assigned Day Lineup</h2>
                {dayArtists.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "0.95rem" }}>No lineup artists scheduled for this date.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                    {dayArtists.map((da) => (
                      <div key={da.event_artist_id} className="artist-day-row">
                        <div className="artist-day-info">
                          <span style={{ fontWeight: 700 }}>🎸 {da.artist_name}</span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            Role:{" "}
                            <span style={{ fontWeight: 600, color: da.is_backup ? "var(--warning)" : "var(--primary)" }}>
                              {da.is_backup ? "BACKUP" : "MAIN"}
                            </span>
                          </span>
                        </div>
                        <button className="btn btn-danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }} onClick={() => void handleUnassignArtist(da.artist_id)}>
                          Unassign
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="panel" style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
              <h3>Select a Day Date</h3>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Choose an active schedule and a specific date from the drop-downs above to manage dates lineup.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminArtistsPage;
