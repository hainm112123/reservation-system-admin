import React, { useEffect, useState } from "react";
import { getEvents, createEvent, updateEvent, cancelEvent, getVenues, createSchedule, createEventDay, getSchedules, getEventDays, deleteSchedule, deleteEventDay, getArtists, getEventArtists, assignArtist } from "../api/admin";
import type { Event, Venue, EventSchedule, EventDay, Artist, EventArtist } from "../api/admin";
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

  // New states for Artists and pop-up validation modal
  const [artists, setArtists] = useState<Artist[]>([]);
  const [dayArtists, setDayArtists] = useState<Record<number, EventArtist[]>>({});
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [modalScheduleId, setModalScheduleId] = useState<number | null>(null);
  const [modalDayDate, setModalDayDate] = useState("");
  const [selectedPrimaries, setSelectedPrimaries] = useState<number[]>([]);
  const [selectedBackups, setSelectedBackups] = useState<number[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cancel Event custom modal states
  const [cancelEventId, setCancelEventId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  const loadEventsAndVenues = async () => {
    if (!token) return;
    try {
      const [evts, vens, arts] = await Promise.all([getEvents(token), getVenues(token), getArtists(token)]);
      setEvents(evts);
      setVenues(vens);
      setArtists(arts);
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
        const artistMap: Record<number, EventArtist[]> = {};
        await Promise.all(
          scheds.map(async (s) => {
            const d = await getEventDays(s.schedule_id, token);
            daysMap[s.schedule_id] = d;
            
            // Query artists for each day
            await Promise.all(
              d.map(async (day) => {
                try {
                  const dayArts = await getEventArtists(day.event_day_id, token);
                  artistMap[day.event_day_id] = dayArts;
                } catch (e) {
                  console.error("Failed to load artists for event day", day.event_day_id, e);
                }
              })
            );
          })
        );
        setDays(daysMap);
        setDayArtists(artistMap);
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

  const handleCancelEvent = (eventId: number) => {
    setCancelEventId(eventId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancelEvent = async () => {
    if (!token || cancelEventId === null) return;
    const reason = cancelReason.trim();
    setShowCancelModal(false);
    setError(null);
    setMessage(null);
    try {
      await cancelEvent(cancelEventId, reason || "Event cancelled by company", token);
      setMessage("Event cancelled successfully. All booked seats refunded!");
      void loadEventsAndVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setCancelEventId(null);
      setCancelReason("");
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
      setDayArtists((prev) => {
        const copy = { ...prev };
        delete copy[dayId];
        return copy;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const selectedEvent = events.find((e) => e.event_id === selectedEventId);
  const isSelectedEventCancelled = selectedEvent?.status === "CANCELLED";

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
                      disabled={e.status === "CANCELLED"}
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
              <section className="panel" style={{ opacity: isSelectedEventCancelled ? 0.65 : 1 }}>
                <h2>Schedule Event Location</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 1rem" }}>
                  Schedule event: <strong>{selectedEvent?.event_name}</strong>
                </p>

                {isSelectedEventCancelled && (
                  <div className="alert-box alert-warning" style={{ marginBottom: "1rem", padding: "0.75rem", fontSize: "0.85rem" }}>
                    ⚠️ Editing disabled because this event has been cancelled.
                  </div>
                )}

                <form onSubmit={handleAddSchedule}>
                  <div className="form-group">
                    <label>Select Venue</label>
                    <select
                      className="form-control"
                      value={schedVenueId}
                      onChange={(e) => setSchedVenueId(Number(e.target.value))}
                      disabled={isSelectedEventCancelled}
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
                      disabled={isSelectedEventCancelled}
                    />
                  </div>

                  <div className="form-group">
                    <label>Registration End</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={regEnd}
                      onChange={(e) => setRegEnd(e.target.value)}
                      disabled={isSelectedEventCancelled}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ marginTop: "0.5rem" }}
                    disabled={isSelectedEventCancelled}
                  >
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
                              disabled={isSelectedEventCancelled}
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
                                onClick={() => {
                                  setModalScheduleId(s.schedule_id);
                                  setModalDayDate("");
                                  setSelectedPrimaries([]);
                                  setSelectedBackups([]);
                                  setModalError(null);
                                  setShowAddDayModal(true);
                                }}
                                disabled={isSelectedEventCancelled}
                              >
                                + Add Day
                              </button>
                            </div>

                            {activeDays.length === 0 ? (
                              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No days created. Standard users cannot book.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {activeDays.map((d) => (
                                  <div
                                    key={d.event_day_id}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      background: "rgba(255,255,255,0.01)",
                                      padding: "0.5rem",
                                      borderRadius: "6px",
                                      border: "1px solid var(--border-color)",
                                    }}
                                  >
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                                        📅 {new Date(d.date).toLocaleString()}
                                      </span>
                                      {dayArtists[d.event_day_id] && (
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.05rem" }}>
                                          <div>
                                            <span style={{ color: "var(--primary)", fontWeight: 600 }}>Performers:</span>{" "}
                                            {dayArtists[d.event_day_id].filter(a => !a.is_backup).map(a => a.artist_name).join(", ") || "None"}
                                          </div>
                                          <div>
                                            <span style={{ color: "var(--warning)", fontWeight: 600 }}>Backups:</span>{" "}
                                            {dayArtists[d.event_day_id].filter(a => a.is_backup).map(a => a.artist_name).join(", ") || "None"}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.75rem", padding: "0.25rem" }}
                                      onClick={() => void handleDeleteDay(s.schedule_id, d.event_day_id)}
                                      disabled={isSelectedEventCancelled}
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
                              {isSelectedEventCancelled ? "View Seats & Tickets 👁️" : "Configure Seats & Tickets 🎟️"}
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

      {showCancelModal && (
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
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-primary)" }}>Cancel Event</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
              Please provide a cancellation reason. This triggers automatic refunds for all booked seats.
            </p>
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Cancellation Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="Event cancelled by company"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: "100%" }}
                autoFocus
              />
            </div>
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
                onClick={() => { setShowCancelModal(false); setCancelEventId(null); setCancelReason(""); }}
              >
                Go Back
              </button>
              <button 
                className="btn btn-danger" 
                style={{ 
                  padding: "0.5rem 1.2rem",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
                onClick={() => void handleConfirmCancelEvent()}
              >
                Cancel Event
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddDayModal && modalScheduleId !== null && (
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
            maxWidth: "600px",
            padding: "2rem",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), var(--border-glow)",
            backgroundColor: "var(--bg-card)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>Add Event Day Schedule</h3>
            
            {modalError && <div className="alert-box alert-warning" style={{ padding: "0.75rem", fontSize: "0.85rem" }}>{modalError}</div>}

            {/* Duration Limit Check & Existing Days display */}
            {(days[modalScheduleId] || []).length >= (selectedEvent?.number_of_days || 1) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="alert-box alert-warning" style={{ margin: 0, padding: "0.75rem", fontSize: "0.85rem" }}>
                  ⚠️ <strong>Duration Limit Reached:</strong> This event allows a maximum of <strong>{selectedEvent?.number_of_days}</strong> day(s). 
                  Please delete an existing day first or cancel adding.
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "1rem" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Existing Scheduled Days:</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {(days[modalScheduleId] || []).map((d) => (
                      <div
                        key={d.event_day_id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "rgba(255,255,255,0.01)",
                          padding: "0.5rem",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)"
                        }}
                      >
                        <span style={{ fontSize: "0.85rem" }}>📅 {new Date(d.date).toLocaleString()}</span>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                          onClick={async () => {
                            if (window.confirm("Remove this event day?")) {
                              try {
                                await deleteEventDay(d.event_day_id, token!);
                                const updatedDays = await getEventDays(modalScheduleId, token!);
                                setDays((prev) => ({ ...prev, [modalScheduleId]: updatedDays }));
                                setDayArtists((prev) => {
                                  const copy = { ...prev };
                                  delete copy[d.event_day_id];
                                  return copy;
                                });
                              } catch (err) {
                                setModalError("Failed to delete event day.");
                              }
                            }
                          }}
                        >
                          Delete Day
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Date Picker */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Event Day Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={modalDayDate}
                    onChange={(e) => setModalDayDate(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Primary Artists Selection */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>
                    Primary Performers (Select at least 1)
                  </label>
                  
                  {/* Selected Primaries Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", minHeight: "34px", padding: "0.25rem", background: "rgba(0,0,0,0.1)", borderRadius: "8px", border: "1px dashed var(--border-color)" }}>
                    {selectedPrimaries.length === 0 ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.25rem 0.5rem" }}>No primary performers selected.</span>
                    ) : (
                      selectedPrimaries.map((id) => {
                        const art = artists.find(a => a.artist_id === id);
                        if (!art) return null;
                        return (
                          <span
                            key={`primary-chip-${id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              background: "rgba(99, 102, 241, 0.15)",
                              border: "1px solid var(--primary)",
                              color: "var(--text-primary)",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                            }}
                          >
                            🎤 {art.artist_name}
                            <span
                              style={{ cursor: "pointer", fontWeight: "bold", color: "var(--danger)", padding: "0 2px" }}
                              onClick={() => setSelectedPrimaries(selectedPrimaries.filter(pid => pid !== id))}
                            >
                              ×
                            </span>
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* Add Performer Dropdown */}
                  <select
                    className="form-control"
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const id = parseInt(val, 10);
                        if (!selectedPrimaries.includes(id)) {
                          setSelectedPrimaries([...selectedPrimaries, id]);
                        }
                      }
                    }}
                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                  >
                    <option value="">-- Add Performer --</option>
                    {artists
                      .filter(art => !selectedPrimaries.includes(art.artist_id) && !selectedBackups.includes(art.artist_id))
                      .map(art => (
                        <option key={`opt-primary-${art.artist_id}`} value={art.artist_id}>
                          {art.artist_name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Backup Artists Selection */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>
                    Backup Artists (Select exactly 2)
                  </label>

                  {/* Selected Backups Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", minHeight: "34px", padding: "0.25rem", background: "rgba(0,0,0,0.1)", borderRadius: "8px", border: "1px dashed var(--border-color)" }}>
                    {selectedBackups.length === 0 ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.25rem 0.5rem" }}>No backup artists selected.</span>
                    ) : (
                      selectedBackups.map((id) => {
                        const art = artists.find(a => a.artist_id === id);
                        if (!art) return null;
                        return (
                          <span
                            key={`backup-chip-${id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              background: "rgba(245, 158, 11, 0.15)",
                              border: "1px solid var(--warning)",
                              color: "var(--text-primary)",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                            }}
                          >
                            🛡️ {art.artist_name}
                            <span
                              style={{ cursor: "pointer", fontWeight: "bold", color: "var(--danger)", padding: "0 2px" }}
                              onClick={() => setSelectedBackups(selectedBackups.filter(bid => bid !== id))}
                            >
                              ×
                            </span>
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* Add Backup Dropdown */}
                  <select
                    className="form-control"
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const id = parseInt(val, 10);
                        if (!selectedBackups.includes(id)) {
                          setSelectedBackups([...selectedBackups, id]);
                        }
                      }
                    }}
                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                  >
                    <option value="">-- Add Backup Artist --</option>
                    {artists
                      .filter(art => !selectedPrimaries.includes(art.artist_id) && !selectedBackups.includes(art.artist_id))
                      .map(art => (
                        <option key={`opt-backup-${art.artist_id}`} value={art.artist_id}>
                          {art.artist_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {/* Footer controls */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
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
                onClick={() => {
                  setShowAddDayModal(false);
                  setModalScheduleId(null);
                  setModalDayDate("");
                  setSelectedPrimaries([]);
                  setSelectedBackups([]);
                  setModalError(null);
                }}
              >
                Cancel
              </button>
              
              {(days[modalScheduleId] || []).length < (selectedEvent?.number_of_days || 1) && (
                <button
                  className="btn btn-primary"
                  style={{ 
                    padding: "0.5rem 1.2rem",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                  onClick={async () => {
                    setModalError(null);
                    if (!modalDayDate) {
                      setModalError("Please select a date and time.");
                      return;
                    }
                    if (selectedPrimaries.length < 1) {
                      setModalError("Please select at least 1 primary artist.");
                      return;
                    }
                    if (selectedBackups.length !== 2) {
                      setModalError("Please select exactly 2 backup artists.");
                      return;
                    }
                    
                    try {
                      // 1. Create event day
                      const newDay = await createEventDay({
                        schedule_id: modalScheduleId,
                        date: new Date(modalDayDate).toISOString()
                      }, token!);
                      
                      // 2. Assign primary artists
                      for (const pid of selectedPrimaries) {
                        await assignArtist({
                          event_day_id: newDay.event_day_id,
                          artist_id: pid,
                          is_backup: false
                        }, token!);
                      }
                      
                      // 3. Assign backup artists
                      for (const bid of selectedBackups) {
                        await assignArtist({
                          event_day_id: newDay.event_day_id,
                          artist_id: bid,
                          is_backup: true
                        }, token!);
                      }
                      
                      // Success! Reload days
                      const updatedDays = await getEventDays(modalScheduleId, token!);
                      setDays((prev) => ({ ...prev, [modalScheduleId]: updatedDays }));
                      
                      // Fetch artists for new day
                      const updatedArts = await getEventArtists(newDay.event_day_id, token!);
                      setDayArtists((prev) => ({
                        ...prev,
                        [newDay.event_day_id]: updatedArts
                      }));
                      
                      // Close modal
                      setShowAddDayModal(false);
                      setModalScheduleId(null);
                      setModalDayDate("");
                      setSelectedPrimaries([]);
                      setSelectedBackups([]);
                    } catch (err) {
                      setModalError(err instanceof Error ? err.message : "Failed to add event day and artists.");
                    }
                  }}
                >
                  Add Day
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminEventsPage;
