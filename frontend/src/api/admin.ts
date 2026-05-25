import { apiRequest } from "./client";

// Types
export interface Event {
  event_id: number;
  event_name: string;
  description?: string;
  number_of_days?: number;
  banner_url?: string;
  status: string;
}

export interface Venue {
  venue_id: number;
  venue_name: string;
  city: string;
  capacity: number;
}

export interface EventSchedule {
  schedule_id: number;
  event_id: number;
  venue_id: number;
  registration_start?: string;
  registration_end?: string;
  seat_layout?: string;
}

export interface EventDay {
  event_day_id: number;
  schedule_id: number;
  date: string;
}

export interface TicketConfig {
  config_id: number;
  schedule_id: number;
  ticket_type: string;
  price: number;
  max_quantity: number;
  remaining_quantity?: number;
}

export interface Artist {
  artist_id: number;
  artist_name: string;
}

export interface EventArtist {
  event_artist_id: number;
  event_day_id: number;
  artist_id: number;
  artist_name: string;
  is_backup: boolean;
}

export interface ETicket {
  ticket_id: number;
  ticket_config_id: number;
  event_day_id: number;
  booking_id?: number | null;
  ticket_code?: string | null;
  ticket_status: string;
  row_label?: string | null;
  col_number?: number | null;
}

export interface Booking {
  booking_id: number;
  schedule_id: number;
  customer_name: string;
  phone: string;
  email: string;
  payment_account?: string;
  booking_status: string;
  total_amount: number;
  created_at?: string;
  e_tickets?: ETicket[];
}

export interface Refund {
  refund_id: number;
  booking_id: number;
  gateway_refund_id?: string;
  amount: number;
  status: string;
  reason?: string;
  is_manual: boolean;
  created_at: string;
}

// APIs
export async function loginAdmin(username: string, password: string): Promise<{ access_token: string }> {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  return apiRequest("/admin/login", { method: "POST", form });
}

// Events CRUD
export async function getEvents(token: string): Promise<Event[]> {
  return apiRequest("/admin/events", { token });
}

export async function getEvent(eventId: number, token: string): Promise<Event> {
  return apiRequest(`/admin/events/${eventId}`, { token });
}

export async function createEvent(event: Omit<Event, "event_id" | "status">, token: string): Promise<Event> {
  return apiRequest("/admin/events", { method: "POST", body: event, token });
}

export async function updateEvent(eventId: number, event: Partial<Event>, token: string): Promise<Event> {
  return apiRequest(`/admin/events/${eventId}`, { method: "PUT", body: event, token });
}

export async function cancelEvent(eventId: number, reason: string, token: string): Promise<{ message: string }> {
  return apiRequest(`/admin/events/${eventId}/cancel?reason=${encodeURIComponent(reason)}`, { method: "POST", token });
}

// Venues CRUD
export async function getVenues(token: string): Promise<Venue[]> {
  return apiRequest("/admin/venues", { token });
}

export async function createVenue(venue: Omit<Venue, "venue_id">, token: string): Promise<Venue> {
  return apiRequest("/admin/venues", { method: "POST", body: venue, token });
}

export async function updateVenue(venueId: number, venue: Partial<Venue>, token: string): Promise<Venue> {
  return apiRequest(`/admin/venues/${venueId}`, { method: "PUT", body: venue, token });
}

export async function deleteVenue(venueId: number, token: string): Promise<void> {
  return apiRequest(`/admin/venues/${venueId}`, { method: "DELETE", token });
}

// Schedules
export async function getSchedules(eventId: number | null, token: string): Promise<EventSchedule[]> {
  const path = eventId ? `/admin/events/schedules?event_id=${eventId}` : "/admin/events/schedules";
  return apiRequest(path, { token });
}

export async function getSchedule(scheduleId: number, token: string): Promise<EventSchedule> {
  return apiRequest(`/admin/events/schedules/${scheduleId}`, { token });
}

export async function createSchedule(sched: Omit<EventSchedule, "schedule_id">, token: string): Promise<EventSchedule> {
  return apiRequest("/admin/events/schedules", { method: "POST", body: sched, token });
}

export async function updateSchedule(scheduleId: number, sched: Partial<EventSchedule>, token: string): Promise<EventSchedule> {
  return apiRequest(`/admin/events/schedules/${scheduleId}`, { method: "PUT", body: sched, token });
}

export async function deleteSchedule(scheduleId: number, token: string): Promise<void> {
  return apiRequest(`/admin/events/schedules/${scheduleId}`, { method: "DELETE", token });
}

// Event Days
export async function getEventDays(scheduleId: number, token: string): Promise<EventDay[]> {
  return apiRequest(`/admin/events/days?schedule_id=${scheduleId}`, { token });
}

export async function createEventDay(day: Omit<EventDay, "event_day_id">, token: string): Promise<EventDay> {
  return apiRequest("/admin/events/days", { method: "POST", body: day, token });
}

export async function deleteEventDay(dayId: number, token: string): Promise<void> {
  return apiRequest(`/admin/events/days/${dayId}`, { method: "DELETE", token });
}

// Ticket Configs
export async function getTicketConfigs(scheduleId: number, token: string): Promise<TicketConfig[]> {
  return apiRequest(`/admin/events/ticket-configs?schedule_id=${scheduleId}`, { token });
}

export async function createTicketConfig(config: Omit<TicketConfig, "config_id">, token: string): Promise<TicketConfig> {
  return apiRequest("/admin/events/ticket-configs", { method: "POST", body: config, token });
}

export async function deleteTicketConfig(configId: number, token: string): Promise<void> {
  return apiRequest(`/admin/events/ticket-configs/${configId}`, { method: "DELETE", token });
}

// Artists CRUD
export async function getArtists(token: string): Promise<Artist[]> {
  return apiRequest("/admin/artists", { token });
}

export async function createArtist(artist: Omit<Artist, "artist_id">, token: string): Promise<Artist> {
  return apiRequest("/admin/artists", { method: "POST", body: artist, token });
}

export async function updateArtist(artistId: number, artist: Partial<Artist>, token: string): Promise<Artist> {
  return apiRequest(`/admin/artists/${artistId}`, { method: "PUT", body: artist, token });
}

export async function deleteArtist(artistId: number, token: string): Promise<void> {
  return apiRequest(`/admin/artists/${artistId}`, { method: "DELETE", token });
}

// Day Assignments
export async function getEventArtists(eventDayId: number, token: string): Promise<EventArtist[]> {
  return apiRequest(`/admin/artists/days/${eventDayId}`, { token });
}

export async function assignArtist(assignment: Omit<EventArtist, "event_artist_id" | "artist_name">, token: string): Promise<EventArtist> {
  return apiRequest("/admin/artists/assign", { method: "POST", body: assignment, token });
}

export async function unassignArtist(eventDayId: number, artistId: number, token: string): Promise<{ message: string; warning?: string }> {
  return apiRequest(`/admin/artists/unassign?event_day_id=${eventDayId}&artist_id=${artistId}`, { method: "POST", token });
}

export async function validateBackups(eventDayId: number, token: string): Promise<{ valid: boolean; warning?: string }> {
  return apiRequest(`/admin/artists/days/${eventDayId}/validate-backups`, { token });
}

// Seats
export async function getSeatLayout(scheduleId: number, token: string): Promise<{ seats: any[] }> {
  return apiRequest(`/admin/schedules/${scheduleId}/seats`, { token });
}

export async function saveSeatLayout(scheduleId: number, seats: any[], token: string): Promise<{ message: string }> {
  return apiRequest(`/admin/schedules/${scheduleId}/seats`, { method: "POST", body: { seats }, token });
}

// Bookings & Refunds
export async function getBookings(token: string): Promise<Booking[]> {
  return apiRequest("/admin/bookings", { token });
}

export async function getBooking(bookingId: number, token: string): Promise<Booking> {
  return apiRequest(`/admin/bookings/${bookingId}`, { token });
}

export async function triggerManualRefund(bookingId: number, token: string): Promise<{ message: string; booking_status: string }> {
  return apiRequest(`/admin/bookings/${bookingId}/manual-refund`, { method: "POST", token });
}

export async function getRefunds(token: string): Promise<Refund[]> {
  return apiRequest("/admin/bookings/refunds/all", { token });
}
