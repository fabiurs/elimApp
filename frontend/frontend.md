# 🎨 Frontend Specification: Church Booking System
**Framework:** React 18 (Vite 4) + Tailwind CSS 3 + Framer Motion  
**Routing:** React Router 6  
**State:** Context API (AuthContext)

---

## 1. Setup & Running

### Prerequisites
- Node.js installed
- Backend running on `http://localhost:5000`
- PostgreSQL database running with schema applied

### Run Frontend
```sh
cd frontend
npm install
npm run dev
```
The app runs on [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to the backend at `localhost:5000`.

### Run Backend
```sh
cd backend
npm install
npm run dev
```
The API runs on [http://localhost:5000](http://localhost:5000).

### Database Setup
```sh
python database/create_db.py
```
Creates the `elimDatabase` PostgreSQL database and applies `schema.sql`.

### Environment
Create a `.env` file in the project root:
```env
BACKEND_PORT=5000
JWT_SECRET=<your-secret>
DATABASE_NAME=elimDatabase
DATABASE_USER=postgres
DATABASE_PASSWORD=<password>
DATABASE_HOST=localhost
DATABASE_PORT=5432
FRONTEND_PORT=5173
```

---

## 2. Dependencies

| Package | Version | Purpose |
| :--- | :--- | :--- |
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | React DOM renderer |
| react-router-dom | ^6.16.0 | Client-side routing |
| framer-motion | ^10.0.0 | Animations (modals, transitions, hover effects) |
| date-fns | ^4.1.0 | Date formatting |
| tailwindcss (dev) | ^3.4.19 | Utility-first CSS framework |
| vite (dev) | ^4.0.0 | Build tool + dev server |
| @vitejs/plugin-react (dev) | ^4.0.0 | Vite React plugin |
| autoprefixer | ^10.4.24 | PostCSS autoprefixing |
| postcss | ^8.5.6 | CSS processing |

---

## 3. Design Tokens

- **Primary Color:** `#6366F1` (Indigo 600)
- **Background:** `#F8FAFC` (Slate 50)
- **Text Headlines:** `#1E293B` (Slate 800)
- **Text Body:** `#64748B` (Slate 500)
- **Border Radius:** `1.5rem` (24px) for cards, `0.75rem` (12px) for buttons
- **Shadows:** Soft `box-shadow: 0 4px 20px rgba(0,0,0,0.05)`

---

## 4. Routes

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `HomeWithNav` → `RoomGallery` | Browse and select a room |
| `/booking` | `BookingPage` → `TimePicker` | Pick date and time slot for selected room |
| `/summary` | `SummaryPage` | Review and confirm booking |
| `/dashboard` | `Dashboard` | User's bookings / Admin management panel |
| `/calendar` | `Calendar` | Weekly calendar view of approved bookings |

**Auth Gate:** If no user is logged in, the entire app is replaced by a full-screen `LoginModal`. No routes are accessible without authentication.

---

## 5. Components

| Component | File | Purpose |
| :--- | :--- | :--- |
| **Navbar** | `Navbar.jsx` | Sticky top nav with branding, links (Rooms, Dashboard, Calendar), user name, Logout button. Shows admin-specific links based on `user.role`. |
| **LoginModal** | `LoginModal.jsx` | Animated modal with Sign In / Register tabs. Handles email+password login and name+email+password registration via `AuthContext`. |
| **RoomGallery** | `RoomGallery.jsx` | Fetches rooms via `useRooms(token)` and renders a grid of `RoomCard` components. Shows loading/empty states. |
| **RoomCard** | `RoomCard.jsx` | Card displaying room image, name, capacity, amenity badges, and a "Select" button that triggers the booking flow. |
| **TimePicker** | `TimePicker.jsx` | Date selector (next 7 days) + 48 half-hour time slots (00:00–23:30). Already-approved bookings are greyed out. Supports range selection (click start, click end). Shows bottom bar with selection summary and "Continue" button. Navigates to `/summary`. |
| **BookingSummary** | `BookingSummary.jsx` | Reusable fixed bottom bar showing room name, date, time range, and Confirm button. |
| **Dashboard** | `Dashboard.jsx` | **Admin view:** Rooms table with Edit/Delete buttons, "Add Room" button, pending bookings with Approve/Reject actions, approved bookings list. **User view:** Table of user's bookings with colored status (green=approved, orange=pending, red=rejected). Uses `useRooms`, `useBookings`, `useAdminBookings`. |
| **Calendar** | `Calendar.jsx` | Room selector dropdown + 7-day week grid. Fetches approved bookings via `/api/bookings/calendar` and displays them as colored chips per day per room. |
| **AddRoomModal** | `AddRoomModal.jsx` | Animated modal form for admins to create a room (name, image URL, capacity, comma-separated amenities). POSTs to `/api/rooms` with auth token. |

---

## 6. Context & Hooks

### AuthContext (`context/AuthContext.jsx`)
Provides: `{ user, token, isAdmin, login, register, logout, loading }`
- Persists JWT in `localStorage`
- On mount, calls `GET /api/auth/me` to rehydrate user session from stored token
- `isAdmin` derived from `user.role === 'admin'`

### `useRooms(token)` (`hooks/useRooms.js`)
- Fetches `GET /api/rooms` on mount
- Returns `{ rooms, loading }`

### `useBookings(token)` (`hooks/useBookings.js`)
- Fetches `GET /api/bookings` (current user's bookings)
- Exposes `createBooking(data)` → `POST /api/bookings` (auto-refreshes list)
- Returns `{ bookings, createBooking, loading, error, refetch }`

### `useAdminBookings(token)` (`hooks/useBookings.js`)
- Fetches `GET /api/admin/bookings` (all bookings, admin only)
- Exposes `updateStatus(id, status)` → `PATCH /api/admin/bookings/:id`
- Returns `{ bookings, loading, updateStatus, refetch }`

---

## 7. Booking Flow

1. **Login** → User authenticates via `LoginModal` (app is gated).
2. **Select Room** (`/`) → `RoomGallery` shows all rooms. User clicks "Select" on a card.
3. **Pick Time** (`/booking`) → `BookingPage` fetches approved bookings for the selected room+date from `/api/bookings/calendar` and converts them to greyed-out 30-min slot keys. User selects a start and end time, then clicks "Continue".
4. **Confirm** (`/summary`) → `SummaryPage` displays room name, date, and time range. "Confirm Booking" calls `createBooking()` → `POST /api/bookings`. Booking is created with status **pending**. Redirects to Dashboard.
5. **Admin Approval** → Admin views pending bookings on Dashboard, clicks Approve/Reject → `PATCH /api/admin/bookings/:id`.
6. **Calendar** (`/calendar`) → Only approved bookings appear on the weekly calendar view.

---

## 8. Project Structure
```text
frontend/
  index.html
  vite.config.js          # Vite config with /api proxy to localhost:5000
  tailwind.config.js
  postcss.config.js
  package.json
  src/
    main.jsx               # React entry point
    App.jsx                # Routes, booking flow state, auth gate
    index.css              # Tailwind imports
    context/
      AuthContext.jsx       # Auth state provider
    hooks/
      useRooms.js          # Room fetching hook
      useBookings.js       # User + admin bookings hooks
      useSkeleton.js       # Skeleton placeholder utility
    components/
      Navbar.jsx           # Navigation bar
      LoginModal.jsx       # Sign in / Register modal
      RoomGallery.jsx      # Room grid (fetches from API)
      RoomCard.jsx         # Individual room card
      TimePicker.jsx       # Date + time slot picker
      BookingSummary.jsx   # Floating booking summary bar
      Dashboard.jsx        # User/Admin dashboard
      Calendar.jsx         # Weekly calendar view
      AddRoomModal.jsx     # Admin room creation modal
```
