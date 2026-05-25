import React, { useEffect, useState } from "react";
import { getEvents, createEvent, updateEvent, cancelEvent, getVenues, createSchedule, createEventDay, getSchedules, getEventDays, deleteSchedule, deleteEventDay } from "../api/admin";
import type { Event, Venue, EventSchedule, EventDay } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export const AdminEventsPage: React.FC<{ setSelectedScheduleId: (id: number | null) => void; setPage: (page: string) => void }> = ({ setSelectedScheduleId, setPage }) => {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  
  // Event forms
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [numDays, setNumDays] = useState<number>(1);
  const [bannerUrl, setBannerUrl] = useState("");
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  
  // Active detail view
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<EventSchedule[]>([]);
  
  // Schedule form
  const [schedVenueId, setSchedVenueId] = useState<number>(0);
  const [regStart, setRegStart] = useState("");
  const [regEnd, setRegEnd] = useState("");
  
  // Event Day form
  const [selectedScheduleIdForDay, setSelectedScheduleIdForDay] = useState<number | null>(null);
  const [days, setDays] = useState<Record<number, EventDay[]>>({});
  const [dayDate, setDayDate] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEventsAndVenues = async () => {
    if (!token) return;
    try {
      const [evts, vens] = await Promise.all([getEvents(token), getVenues(token)]);
      setEvents(evts);
      setVenues(vens);
      if (vens.length > 0) setSchedVenueId(vens[0].venue_id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void loadEventsAndVenues();
  }, [token]);

  // Load schedules when an event is selected
  useEffect(() => {
    async function loadSchedules() {
      if (!token || !selectedEventId) return;
      try {
        const scheds = await getSchedules(selectedEventId, token);
        setSchedules(scheds);
        
        // Also fetch event days for each schedule
        const daysMap: Record<number, EventDay[]> = {};
        await Promise.all(
          scheds.map(async (s) => {
            const d = await getEventDays(s.schedule_id, token);
            daysMap[s.schedule_id] = d;
          })
        );
        setDays(daysMap);
      } catch (err) {
        console.error(err);
      }
    }
    void loadSchedules();
  }, [selectedEventId, token]);

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setMessage(null);

    if (!eventName) {
      setError("Event name is required.");
      return;
    }

    try {
      if (editingEventId) {
        await updateEvent(editingEventId, { event_name: eventName, description, number_of_days: numDays, banner_url: bannerUrl }, token);
        setMessage("Event updated successfully!");
      } else {
        await createEvent({ event_name: eventName, description, number_of_days: numDays, banner_url: bannerUrl }, token);
        setMessage("Event created successfully!");
      }
      setEventName("");
      setDescription("");
      setNumDays(1);
      setBannerUrl("");
      setEditingEventId(null);
      void loadEventsAndVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleCancelEvent = async (eventId: number) => {
    const reason = window.prompt("Please provide a cancellation reason (this triggers automatic refunds):");
    if (reason === null) return; // cancelled prompt
    if (!token) return;
    try {
      await cancelEvent(eventId, reason || "Event cancelled by company", token);
      setMessage("Event cancelled successfully. All booked seats refunded!");
      void loadEventsAndVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed");
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedEventId || !schedVenueId) return;
    setError(null);
    setMessage(null);

    try {
      await createSchedule({
        event_id: selectedEventId,
        venue_id: schedVenueId,
        registration_start: regStart ? new Date(regStart).toISOString() : undefined,
        registration_end: regEnd ? new Date(regEnd).toISOString() : undefined
      }, token);

      // Reload schedules before showing success so the UI reflects the new state.
      const scheds = await getSchedules(selectedEventId, token);
      setSchedules(scheds);
      setRegStart("");
      setRegEnd("");
      setMessage("Schedule allocated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Schedule allocation failed");
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!token || !selectedEventId || !window.confirm("Delete this schedule? All associated day allocations will be deleted too.")) return;
    try {
      await deleteSchedule(scheduleId, token);
      setMessage("Schedule removed.");
      const scheds = await getSchedules(selectedEventId, token);
      setSchedules(scheds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedScheduleIdForDay || !dayDate) return;
    setError(null);
    setMessage(null);

    try {
      await createEventDay({
        schedule_id: selectedScheduleIdForDay,
        date: new Date(dayDate).toISOString()
      }, token);
      setMessage("Event day added successfully!");
      setDayDate("");
      
      // Reload days
      const d = await getEventDays(selectedScheduleIdForDay, token);
      setDays((prev) => ({ ...prev, [selectedScheduleIdForDay]: d }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add day failed");
    }
  };

  const handleDeleteDay = async (scheduleId: number, dayId: number) => {
    if (!token || !window.confirm("Remove this event day?")) return;
    try {
      await deleteEventDay(dayId, token);
      setMessage("Event day removed.");
      const d = await getEventDays(scheduleId, token);
      setDays((prev) => ({ ...prev, [scheduleId]: d }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="header-title">Event & Schedule Workspace</h1>
        <p className="header-desc">Manage event listings, schedule them inside venue halls, and assign dates.</p>
      </div>

      {message && <div className="alert-box alert-success">{message}</div>}
      {error && <div className="alert-box alert-warning">{error}</div>}

      <div className="grid-cols-2">
        {/* Left: Event Form and Lists */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <section className="panel">
            <h2>{editingEventId ? "Edit Event details" : "Create Event Listing"}</h2>
            <form onSubmit={handleEventSubmit} style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label>Event Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ultra Summer Music Festival"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Details of the event guests, guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Duration (days)</label>
                <input
                  type="number"
                  min={1}
                  className="form-control"
                  value={numDays}
                  onChange={(e) => setNumDays(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Banner URL (Image Link)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. https://images.unsplash.com/photo-xxx"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="submit" className="btn btn-primary">
                  {editingEventId ? "Save Changes" : "Publish Event"}
                </button>
                {editingEventId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingEventId(null);
                      setEventName("");
                      setDescription("");
                      setNumDays(1);
                      setBannerUrl("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="panel">
            <h2>All Active Events</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem" }}>
              {events.map((e) => (
                <div
                  key={e.event_id}
                  className="panel"
                  style={{
                    background: selectedEventId === e.event_id ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)",
                    border: selectedEventId === e.event_id ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                    padding: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                  onClick={() => setSelectedEventId(e.event_id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem" }}>{e.event_name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                        {e.number_of_days} days • status:{" "}
                        <span className={`badge ${e.status === "ACTIVE" ? "badge-active" : "badge-cancelled"}`}>{e.status}</span>
                      </p>
                    </div>
                    {e.banner_url && (
                      <img src={e.banner_url} alt="banner" style={{ width: "60px", height: "40px", borderRadius: "4px", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                      onClick={() => {
                        setEditingEventId(e.event_id);
                        setEventName(e.event_name);
                        setDescription(e.description || "");
                        setNumDays(e.number_of_days || 1);
                        setBannerUrl(e.banner_url || "");
                      }}
                    >
                      Edit
                    </button>
                    {e.status === "ACTIVE" && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                        onClick={() => void handleCancelEvent(e.event_id)}
                      >
                        Cancel Event
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Selected Event Schedule Allocations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {selectedEventId ? (
            <>
              {/* Allocate Schedule Panel */}
              <section className="panel">
                <h2>Schedule Event Location</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 1rem" }}>
                  Schedule event: <strong>{events.find((e) => e.event_id === selectedEventId)?.event_name}</strong>
                </p>

                <form onSubmit={handleAddSchedule}>
                  <div className="form-group">
                    <label>Select Venue</label>
                    <select
                      className="form-control"
                      value={schedVenueId}
                      onChange={(e) => setSchedVenueId(Number(e.target.value))}
                    >
                      {venues.map((v) => (
                        <option key={v.venue_id} value={v.venue_id}>
                          {v.venue_name} ({v.city} - cap: {v.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Registration Start</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={regStart}
                      onChange={(e) => setRegStart(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Registration End</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={regEnd}
                      onChange={(e) => setRegEnd(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
                    Allocate Venue Schedule
                  </button>
                </form>
              </section>

              {/* Active Schedules Lists */}
              <section className="panel">
                <h2>Active Schedule Allocations</h2>
                {schedules.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "0.95rem" }}>
                    No venue locations scheduled yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
                    {schedules.map((s) => {
                      const vName = venues.find((v) => v.venue_id === s.venue_id)?.venue_name || `Venue #${s.venue_id}`;
                      const activeDays = days[s.schedule_id] || [];

                      return (
                        <div
                          key={s.schedule_id}
                          className="panel"
                          style={{ background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: "1rem" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h3 style={{ fontSize: "1rem" }}>{vName}</h3>
                              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                                Registration: {s.registration_start ? new Date(s.registration_start).toLocaleDateString() : "Immediate"} to{" "}
                                {s.registration_end ? new Date(s.registration_end).toLocaleDateString() : "Event End"}
                              </p>
                            </div>
                            <button
                              className="btn btn-danger"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() => void handleDeleteSchedule(s.schedule_id)}
                            >
                              Delete
                            </button>
                          </div>

                          {/* Event Days list */}
                          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "0.75rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>Day Schedules ({activeDays.length})</span>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                                onClick={() => setSelectedScheduleIdForDay(selectedScheduleIdForDay === s.schedule_id ? null : s.schedule_id)}
                              >
                                {selectedScheduleIdForDay === s.schedule_id ? "Hide Form" : "+ Add Day"}
                              </button>
                            </div>

                            {selectedScheduleIdForDay === s.schedule_id && (
                              <form
                                onSubmit={handleAddDay}
                                style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", alignItems: "flex-end" }}
                              >
                                <div className="form-group" style={{ margin: 0, flexGrow: 1 }}>
                                  <input
                                    type="datetime-local"
                                    className="form-control"
                                    style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                                    value={dayDate}
                                    onChange={(e) => setDayDate(e.target.value)}
                                  />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                                  Save
                                </button>
                              </form>
                            )}

                            {activeDays.length === 0 ? (
                              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No days created. Standard users cannot book.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                {activeDays.map((d) => (
                                  <div
                                    key={d.event_day_id}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      background: "rgba(255,255,255,0.01)",
                                      padding: "0.3rem 0.5rem",
                                      borderRadius: "6px",
                                    }}
                                  >
                                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                                      📅 {new Date(d.date).toLocaleString()}
                                    </span>
                                    <button
                                      style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.75rem" }}
                                      onClick={() => void handleDeleteDay(s.schedule_id, d.event_day_id)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quick Config Button */}
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                            <button
                              className="btn btn-primary"
                              style={{ width: "100%", padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                              onClick={() => {
                                setSelectedScheduleId(s.schedule_id);
                                setPage("setup");
                              }}
                            >
                              Configure Seats & Tickets 🎟️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="panel" style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
              <h3>Select an Event</h3>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Choose an event from the left list to configure schedules and dates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminEventsPage;
