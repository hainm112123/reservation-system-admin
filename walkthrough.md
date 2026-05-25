# Admin Project - Implementation Walkthrough

We have successfully developed the separate **Admin Project** under `project/admin`. It connects to the same PostgreSQL database as the customer project and implements all required administration roles with state-of-the-art aesthetics and robust business rules.

---

## What We Accomplished

### 1. Shared Database Migration & Schema Adjustments
- Created and successfully executed [admin/schema_patch.sql](file:///d:/Personal/Documents/3rd%20Year%20-%20Semester%202/System%20Analysis%20and%20Design/Project/admin/schema_patch.sql) on the PostgreSQL database, resulting in:
  - Adding `status` and `banner_url` columns to `events`.
  - Adding `registration_start`, `registration_end`, and `seat_layout` columns to `event_schedules`.
  - Dropping legacy `booking_details` table and recreating `e_tickets` directly referenced to `bookings`.
  - Extending `e_tickets` with visual floorplan seating coordinates: `row_label` and `col_number`.

### 2. FastAPI Backend Application (`project/admin/backend`)
- Developed a clean, decoupled architecture:
  - **Models**: [e_ticket.py](file:///d:/Personal/Documents/3rd%20Year%20-%20Semester%202/System%20Analysis%20and%20Design/Project/admin/backend/app/models/e_ticket.py) and [event_schedule.py](file:///d:/Personal/Documents/3rd%20Year%20-%20Semester%202/System%20Analysis%20and%20Design/Project/admin/backend/app/models/event_schedule.py) (includes `seat_layout` JSON text mapping).
  - **Pydantic Schemas**: Structured input, update, and read models for all tables, completely handling custom ticket config rules and visual coordinates serialization.
  - **CRUD Layer**: Core database helpers for adding/listing/updating entities.
  - **Business Services Layer**:
    - `validate_schedule_capacity`: Protects the venue from overcapacity designs.
    - `cancel_event`: Cancel dates, set status, and flag customer bookings for refunding.
    - `validate_backup_count`: Enforces $\geq 2$ backup artists assigned for each active date.
    - `save_seat_layout_and_pregenerate`: Persists designed visual coordinates and pre-generates physical seats (`row_label`, `col_number`) in the `e_tickets` database for **each scheduled date**, making `normal` and `special` seats `'Available'` and `vip` seats `'Reserved'` (preventing standard customer booking while respecting overall capacity).
  - **API Routers**: Secured REST API endpoints for admin login, venues, events, day allocations, and bookings monitoring.

### 3. High-Fidelity React + TypeScript Frontend (`project/admin/frontend`)
- Initialized a modern Vite + React + TS skeleton and styled it using a premium, dark-theme Glassmorphic Vanilla CSS system.
- Designed key views:
  - **Dashboard**: Summary metrics widgets showing active events, locations, and real-time revenue collection.
  - **Event & Venue Editors**: Standard listings and input forms to create/modify structures.
  - **Interactive Seat Map Designer**:
    - Visual board of rows A to J and columns 1 to 18 (matching `sample_map.png`).
    - Paint-brush tool enabling ticketing staff to toggle empty slots, and paint Normal (Indigo), Special (Violet), and VIP (Amber - invite only) seat types.
    - Features a live-glowing capacity tracker progress bar warning staff if they exceed venue limits.
    - Triggers backend e-ticket list pre-generation upon save.
  - **Artist Day Lineup Manager**: Select days, assign main or backup artists, and features an orange glowing warning message if less than 2 backup artists are allocated to the selected date.

---

## Validation & Verification Results

1. **Backend Verification**:
   - Successfully executed importing checks against all models, routers, and schemas. Confirmed imports compile flawlessly:
     ```powershell
     & ".venv/Scripts/python.exe" -c "import app.main; print('import ok')"
     # Output: import ok
     ```
2. **Frontend Compilation Check**:
   - Successfully compiled the React + TypeScript application into production output without any errors:
     ```powershell
     npm run build
     # Output: index.html, index.css, index.js successfully generated!
     ```

---

## How to Run the Admin Project

### 1. Launch the Backend Server
Open a terminal in `project/admin/backend`:
```powershell
cd admin/backend
# Activate virtual environment
.\.venv\Scripts\Activate.ps1
# Run FastAPI server
python -m uvicorn app.main:app --reload --port 8001
```
- Admin backend endpoint will run at: `http://localhost:8001`
- Swagger interactive documentation: `http://localhost:8001/docs`

### 2. Launch the Frontend Dev Server
Open another terminal in `project/admin/frontend`:
```powershell
cd admin/frontend
# Run Dev Server
npm run dev
```
- Vite will launch the premium Admin Dashboard portal at: `http://localhost:5174`.
- Sign in with credentials:
  - **Username**: `admin`
  - **Password**: `admin123`
