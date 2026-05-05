# 🟢 Backend Technical Specification
**Project:** Church Booking System (CBS)  
**Stack:** Node.js, Express 5, PostgreSQL, Sequelize 6, JWT

## 1. System Overview
The backend is a RESTful API handling user authentication, room management, and booking operations with role-based access control. It uses Sequelize ORM to interact with a PostgreSQL database.

## 2. Core Dependencies

| Package | Version | Purpose |
| :--- | :--- | :--- |
| express | ^5.2.1 | HTTP server framework |
| sequelize | ^6.37.7 | PostgreSQL ORM |
| pg | ^8.18.0 | PostgreSQL driver |
| googleapis | ^150.0.1 | Google Calendar integration |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT creation/verification |
| helmet | ^8.1.0 | Security headers |
| cors | ^2.8.6 | Cross-origin resource sharing |
| dotenv | ^17.2.4 | Environment variable loading |
| date-fns | ^4.1.0 | Date utilities |
| nodemon (dev) | ^3.1.11 | Auto-restart on file changes |

## 3. Database Models (Sequelize)

### User (`src/models/User.js`)
- `id`: INTEGER, auto-increment, primary key
- `name`: STRING, required
- `email`: STRING, required, unique
- `password_hash`: STRING, required
- `role`: STRING, default 'user' ('user' or 'admin')
- Table: `users`, no timestamps

### Room (`src/models/Room.js`)
- `id`: INTEGER, auto-increment, primary key
- `name`: STRING, required
- `image_url`: STRING
- `capacity`: INTEGER, required
- `amenities`: ARRAY(TEXT), default []
- Table: `rooms`, no timestamps

### Booking (`src/models/Booking.js`)
- `id`: INTEGER, auto-increment, primary key
- `userId`: INTEGER, FK → users(id)
- `roomId`: INTEGER, FK → rooms(id)
- `date`: STRING (YYYY-MM-DD)
- `startTime`: STRING (HH:MM)
- `endTime`: STRING (HH:MM)
- `status`: STRING, default 'pending'
- `notes`: STRING
- Table: `bookings`, no timestamps
- Associations: `belongsTo(User)`, `belongsTo(Room)`

### Event (`src/models/Event.js`)
- `id`: INTEGER, auto-increment, primary key
- `title`: STRING, required
- `description`: TEXT
- `eventType`: STRING, default 'service'
- `date`: DATEONLY, required
- `startTime`: TIME, required
- `endTime`: TIME, required
- `location`: STRING
- `roomId`: INTEGER, optional FK -> rooms(id)
- `createdBy`: INTEGER, required FK -> users(id)
- `status`: STRING, default 'scheduled'
- `googleEventId`: STRING, optional
- Table: `events`, timestamps enabled
- Associations: `belongsTo(User as Creator)`, `belongsTo(Room as Room)`

### EventAssignment (`src/models/EventAssignment.js`)
- `id`: INTEGER, auto-increment, primary key
- `eventId`: INTEGER, required FK -> events(id)
- `role`: STRING, one of `audio|video|lyrics`
- `userId`: INTEGER, required FK -> users(id)
- Table: `event_assignments`, no timestamps
- Constraint: unique `(event_id, role)`

### VolunteerProfile (`src/models/VolunteerProfile.js`)
- `id`: INTEGER, auto-increment, primary key
- `userId`: INTEGER, unique FK -> users(id)
- `phone`: STRING
- `bio`: TEXT
- `autoAssignable`: BOOLEAN, default true
- `preferredRoles`: ARRAY(STRING), default []
- Table: `volunteer_profiles`, timestamps enabled

### VolunteerAvailability (`src/models/VolunteerAvailability.js`)
- `id`: INTEGER, auto-increment, primary key
- `userId`: INTEGER, FK -> users(id)
- `dayOfWeek`: INTEGER (0..6)
- `startTime`: TIME
- `endTime`: TIME
- Table: `volunteer_availabilities`, no timestamps

### VolunteerBlackout (`src/models/VolunteerBlackout.js`)
- `id`: INTEGER, auto-increment, primary key
- `userId`: INTEGER, FK -> users(id)
- `startDate`: DATEONLY
- `endDate`: DATEONLY
- `reason`: STRING (optional)
- Table: `volunteer_blackouts`, no timestamps

## 4. API Endpoints

| Method | Path | Middleware | Handler | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | — | `register` | Create user account, return JWT |
| `POST` | `/api/auth/login` | — | `login` | Authenticate, return JWT |
| `GET` | `/api/auth/me` | `verifyToken` | `me` | Get current user profile |
| `GET` | `/api/rooms` | `verifyToken` | `getRooms` | List all rooms |
| `POST` | `/api/rooms` | `verifyToken`, `isAdmin` | `createRoom` | Create a room (admin) |
| `DELETE` | `/api/rooms/:id` | `verifyToken`, `isAdmin` | `deleteRoom` | Delete a room (admin) |
| `GET` | `/api/bookings` | `verifyToken` | `getUserBookings` | Current user's bookings |
| `GET` | `/api/bookings/calendar` | `verifyToken` | `getApprovedBookings` | All approved bookings |
| `POST` | `/api/bookings` | `verifyToken` | `createBooking` | Create booking (pending) |
| `GET` | `/api/admin/bookings` | `verifyToken`, `isAdmin` | `getAllBookings` | All bookings with user+room |
| `PATCH` | `/api/admin/bookings/:id` | `verifyToken`, `isAdmin` | `updateBookingStatus` | Approve/reject booking |
| `GET` | `/api/events` | `verifyToken` | `getEvents` | List events with assignment details |
| `GET` | `/api/events/my-assignments` | `verifyToken` | `getMyAssignments` | Current user's event assignments |
| `GET` | `/api/events/my-assignments/today` | `verifyToken` | `getTodayAssignments` | Current user's assignments for today |
| `GET` | `/api/events/assignable-users` | `verifyToken`, `isAdmin` | `getAssignableUsers` | List users for assignment pickers |
| `POST` | `/api/events/auto-assign` | `verifyToken`, `isAdmin` | `getAutoAssignmentSuggestions` | Suggest best-fit role assignments |
| `PATCH` | `/api/events/assignments/:assignmentId/response` | `verifyToken` | `respondToAssignment` | Confirm/decline volunteer assignment |
| `POST` | `/api/events` | `verifyToken`, `isAdmin` | `createEvent` | Create event with assignments |
| `PATCH` | `/api/events/:id` | `verifyToken`, `isAdmin` | `updateEvent` | Update event and assignments |
| `DELETE` | `/api/events/:id` | `verifyToken`, `isAdmin` | `deleteEvent` | Delete event and assignments |
| `GET` | `/api/profile/me` | `verifyToken` | `getMyProfile` | Get volunteer profile + availability + blackouts |
| `PUT` | `/api/profile/me` | `verifyToken` | `updateMyProfile` | Update volunteer profile + availability + blackouts |
| `GET` | `/api/attendance/records` | `verifyToken`, `isAdmin` | `getAttendanceRecords` | List attendance records with filters |
| `POST` | `/api/attendance/records` | `verifyToken`, `isAdmin` | `upsertAttendanceRecord` | Create/update event, volunteer, ministry attendance |
| `GET` | `/api/analytics/kpis` | `verifyToken`, `isAdmin` | `getKpis` | Weekly/monthly KPI summary and trends |

## 5. Middleware (`src/middleware/auth.js`)

### `verifyToken`
Extracts JWT from `Authorization: Bearer <token>` header, verifies with `JWT_SECRET`, sets `req.user = { id, role }`.

### `isAdmin`
Checks `req.user.role === 'admin'`. Returns 403 if not admin.

## 6. Business Logic

### Overlap Prevention (`bookingController.js`)
Before creating a booking, queries for any approved booking on the same `roomId` and `date` where `startTime < newEndTime AND endTime > newStartTime`. Returns 409 if overlap exists.

### Event Conflict Prevention (`eventController.js`)
Before creating or updating an event with a room, checks for overlapping events in that room and date where `startTime < existingEndTime AND endTime > existingStartTime`. Returns 409 if overlap exists.

### Auto-Assignment Suggestions (`eventController.js`)
For each media role (`audio`, `video`, `lyrics`), the backend suggests users by combining:
- Volunteer opt-in (`autoAssignable = true`)
- Preferred roles
- Weekly availability slots
- Blackout date exclusion
- Existing event assignment conflicts for the same time window

### Attendance Tracking (`attendanceController.js`)
Attendance supports three categories:
- `event`: attendance totals per event/date
- `volunteer`: volunteer check-in per event/date
- `ministry`: ministry attendance totals per event/date

Records include status (`present|absent|late|excused`) and quantity (default 1) so weekly and monthly trends can be aggregated.

### KPI Analytics (`analyticsController.js`)
The KPI endpoint returns:
- overall attendance totals (events, volunteers, ministries)
- assignment response metrics (confirmed/declined/pending and response rate)
- weekly or monthly trend points
- ministry attendance breakdown

### Auth Flow (`authController.js`)
- **Register:** Validates input → checks duplicate email → hashes password (bcryptjs) → creates user → signs JWT with `{ id, role }` (1 day expiry).
- **Login:** Finds user by email → compares hash → signs JWT.
- **Me:** Looks up user by `req.user.id` from token. All responses strip `password_hash`.

## 7. Project Structure
```text
backend/
  server.js              # Entry point: Express setup, middleware, route mounting, port 5000
  src/
    config/
      db.js              # Sequelize instance + connectDB()
    controllers/
      authController.js  # register, login, me
      roomController.js  # getRooms, createRoom, deleteRoom
      bookingController.js # createBooking, getUserBookings, getApprovedBookings, getAllBookings, updateBookingStatus
      eventController.js # event CRUD, assignments, auto-suggestions
      profileController.js # volunteer profile, availability, blackout management
      attendanceController.js # attendance create/list APIs
      analyticsController.js # KPI aggregation APIs
    middleware/
      auth.js            # verifyToken, isAdmin
    models/
      User.js            # User model
      Room.js            # Room model
      Booking.js         # Booking model + associations
      Event.js           # Event model
      EventAssignment.js # Event role assignment model
      VolunteerProfile.js # User volunteer preferences model
      VolunteerAvailability.js # Weekly availability model
      VolunteerBlackout.js # Blackout date range model
    routes/
      auth.js            # /api/auth/*
      rooms.js           # /api/rooms/*
      bookings.js        # /api/bookings/*
      events.js          # /api/events/*
      profile.js         # /api/profile/*
      attendance.js      # /api/attendance/*
      analytics.js       # /api/analytics/*
      admin.js           # /api/admin/*
```

## 8. Environment Variables
```env
BACKEND_PORT=5000
JWT_SECRET=<secret>
DATABASE_NAME=elimDatabase
DATABASE_USER=postgres
DATABASE_PASSWORD=<password>
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Optional Google Calendar service account sync
GOOGLE_CALENDAR_ID=<calendar-id>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account-email>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<private-key-with-escaped-newlines>
GOOGLE_CALENDAR_TIMEZONE=UTC
```
