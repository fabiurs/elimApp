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

---

## 4. Core Business Logic & Constraints

1. **Overlap Prevention:** Before creating a booking, the system checks for overlapping approved bookings on the same room and date (startTime < existing endTime AND endTime > existing startTime).
2. **Validation:** `end_time` must be strictly greater than `start_time` (enforced at DB and API level).
3. **RBAC:** Two middleware functions — `verifyToken` (JWT validation) and `isAdmin` (checks `role === 'admin'`).
4. **Booking Workflow:** All new bookings start as `pending`. Only admins can approve or reject them. Only approved bookings appear on the calendar and block time slots.

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
  src/components/              # UI components (Navbar, RoomGallery, TimePicker, Dashboard, Calendar, etc.)
```