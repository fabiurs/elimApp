# ⛪ Church Booking System (CBS) - Technical Specification

**Version:** 2.0  
**Project Goal:** A reservation platform for church facilities featuring a modern, Dribbble-inspired UI.

---

## 1. System Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 (Vite) + Tailwind CSS 3 + Framer Motion + React Router 6 |
| **Backend** | Node.js + Express 5 + Sequelize 6 ORM |
| **Database** | PostgreSQL |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs password hashing |

---

## 2. Data Models (PostgreSQL via Sequelize)

### 2.1 Users (`users`)
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `role` | VARCHAR(20) | DEFAULT 'user', CHECK ('user', 'admin') |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 2.2 Rooms (`rooms`)
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(100) | NOT NULL |
| `capacity` | INT | NOT NULL |
| `amenities` | TEXT[] | Array of strings |
| `image_url` | VARCHAR(255) | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 2.3 Bookings (`bookings`)
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `user_id` | INT | FK → users(id) ON DELETE CASCADE |
| `room_id` | INT | FK → rooms(id) ON DELETE CASCADE |
| `booking_date` | DATE | NOT NULL |
| `start_time` | TIME | NOT NULL |
| `end_time` | TIME | NOT NULL |
| `status` | VARCHAR(20) | DEFAULT 'pending', CHECK ('pending', 'approved', 'rejected') |
| `notes` | TEXT | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| | | CONSTRAINT: end_time > start_time |

### 2.4 Events (`events`)
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | |
| `event_type` | VARCHAR(50) | DEFAULT 'service' |
| `date` | DATE | NOT NULL |
| `start_time` | TIME | NOT NULL |
| `end_time` | TIME | NOT NULL |
| `location` | VARCHAR(255) | |
| `room_id` | INT | FK → rooms(id) |
| `created_by` | INT | FK → users(id), NOT NULL |
| `status` | VARCHAR(30) | DEFAULT 'scheduled' |
| `google_event_id` | VARCHAR(255) | Optional ID for Google Calendar sync |

### 2.5 Event Assignments (`event_assignments`)
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `event_id` | INT | FK → events(id) ON DELETE CASCADE |
| `role` | VARCHAR(20) | CHECK ('audio', 'video', 'lyrics') |
| `user_id` | INT | FK → users(id), NOT NULL |
| | | UNIQUE(event_id, role) |

---

## 3. API Endpoints

| Method | Path | Middleware | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new user account |
| `POST` | `/api/auth/login` | Public | Authenticate and get JWT |
| `GET` | `/api/auth/me` | `verifyToken` | Get current user profile |
| `GET` | `/api/rooms` | `verifyToken` | List all rooms |
| `POST` | `/api/rooms` | `verifyToken`, `isAdmin` | Create a room (admin) |
| `DELETE` | `/api/rooms/:id` | `verifyToken`, `isAdmin` | Delete a room (admin) |
| `GET` | `/api/bookings` | `verifyToken` | Get current user's bookings |
| `GET` | `/api/bookings/calendar` | `verifyToken` | Get all approved bookings |
| `POST` | `/api/bookings` | `verifyToken` | Create a booking (pending) |
| `GET` | `/api/admin/bookings` | `verifyToken`, `isAdmin` | Get all bookings with user+room |
| `PATCH` | `/api/admin/bookings/:id` | `verifyToken`, `isAdmin` | Approve or reject a booking |
| `GET` | `/api/events` | `verifyToken` | List events with media assignments |
| `GET` | `/api/events/my-assignments` | `verifyToken` | List events where current user is assigned |
| `GET` | `/api/events/my-assignments/today` | `verifyToken` | List current user's assignments for today |
| `GET` | `/api/events/assignable-users` | `verifyToken`, `isAdmin` | List users for assignment dropdowns |
| `POST` | `/api/events/auto-assign` | `verifyToken`, `isAdmin` | Suggest role assignments based on volunteer availability/preferences |
| `PATCH` | `/api/events/assignments/:assignmentId/response` | `verifyToken` | Volunteer confirms/declines assigned role |
| `POST` | `/api/events` | `verifyToken`, `isAdmin` | Create event + media assignments |
| `PATCH` | `/api/events/:id` | `verifyToken`, `isAdmin` | Update event + media assignments |
| `DELETE` | `/api/events/:id` | `verifyToken`, `isAdmin` | Delete event and media assignments |
| `GET` | `/api/profile/me` | `verifyToken` | Get signed-in user profile, availability, and blackouts |
| `PUT` | `/api/profile/me` | `verifyToken` | Update volunteer profile, availability, and blackout date ranges |
| `GET` | `/api/attendance/records` | `verifyToken`, `isAdmin` | List attendance records by range/category |
| `POST` | `/api/attendance/records` | `verifyToken`, `isAdmin` | Create or update attendance record |
| `GET` | `/api/analytics/kpis` | `verifyToken`, `isAdmin` | KPI summary and weekly/monthly attendance trends |

---

## 4. Core Business Logic & Constraints

1. **Overlap Prevention:** Before creating a booking, the system checks for overlapping approved bookings on the same room and date (startTime < existing endTime AND endTime > existing startTime).
2. **Validation:** `end_time` must be strictly greater than `start_time` (enforced at DB and API level).
3. **RBAC:** Two middleware functions — `verifyToken` (JWT validation) and `isAdmin` (checks `role === 'admin'`).
4. **Booking Workflow:** All new bookings start as `pending`. Only admins can approve or reject them. Only approved bookings appear on the calendar and block time slots.
5. **Media Assignment Workflow:** Admins can assign one person per media role (`audio`, `video`, `lyrics`) per event.
6. **Event Room Conflict Prevention:** Events cannot overlap in the same room on the same date (`startTime < existing endTime` AND `endTime > existing startTime`).
7. **Volunteer Auto-Assignment Suggestions:** Admins can request role suggestions using volunteer preferred roles, weekly availability, blackout windows, and existing assignment conflicts.
8. **Assignment Response Workflow:** Volunteers can respond to event assignments (`confirmed`/`declined`) from mobile or API.
9. **Attendance Tracking:** Attendance records support event-level, volunteer-level, and ministry-level tracking with `present|absent|late|excused` statuses and optional quantities.
10. **Analytics & KPI Trends:** KPI endpoint reports totals and period trends (week or month) for attendance and assignment response rates.
11. **Google Calendar Integration:**
  - Every event response includes a Google Calendar "Add event" URL.
  - Optional service account sync can create/update Google Calendar events when environment variables are configured.
  - Required env vars for sync: `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.

---

## 5. Booking Flow

1. **Login** → User authenticates via LoginModal (app is gated — no access without auth).
2. **Select Room** (`/`) → RoomGallery displays all rooms as cards. User clicks "Select".
3. **Pick Time** (`/booking`) → TimePicker shows next 7 days + 48 half-hour slots. Already-approved bookings are greyed out. User selects a time range and clicks "Continue".
4. **Confirm** (`/summary`) → SummaryPage shows room, date, time. User clicks "Confirm Booking" → `POST /api/bookings` creates a pending booking.
5. **Admin Approval** → Admin views pending bookings on Dashboard and clicks Approve/Reject.
6. **Calendar** (`/calendar`) → Only approved bookings appear on the weekly view.

---

## 6. UI/UX Design

- **Design Tokens:** Primary `#6366F1` (Indigo), Background `#F8FAFC` (Slate 50), Border Radius `1.5rem` cards / `0.75rem` buttons, Soft shadows.
- **Visual Room Selection:** Cards with room images, capacity, amenity badges, and Select button.
- **Interactive Timeline:** Half-hour slot grid with drag-to-select range, booked slots greyed out.
- **Floating Summary:** Bottom bar with selection details and Continue/Confirm actions.
- **Animations:** Framer Motion for modal transitions, card hover effects, and layout animations.
- **Auth Gate:** Full-screen login/register modal when not authenticated.

---

## 7. Project Structure

```
backend/
  server.js                    # Express entry point (port 5000)
  src/config/db.js             # Sequelize PostgreSQL connection
  src/models/User.js           # User model
  src/models/Room.js           # Room model
  src/models/Booking.js        # Booking model with User/Room associations
  src/controllers/             # Route handlers (auth, room, booking)
  src/middleware/auth.js        # verifyToken + isAdmin middleware
  src/routes/                  # Express route definitions

database/
  schema.sql                   # PostgreSQL DDL
  create_db.py                 # Create DB + apply schema
  drop_db.py                   # Drop DB

frontend/
  src/App.jsx                  # Routes + booking flow state management
  src/context/AuthContext.jsx   # Auth state (user, token, isAdmin, login, register, logout)
  src/hooks/useRooms.js        # Fetch rooms
  src/hooks/useBookings.js     # User bookings + admin bookings hooks
  src/hooks/useEvents.js       # Events + assignment hooks
  src/components/              # UI components (Navbar, RoomGallery, TimePicker, Dashboard, Calendar, etc.)
```