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

## 5. Middleware (`src/middleware/auth.js`)

### `verifyToken`
Extracts JWT from `Authorization: Bearer <token>` header, verifies with `JWT_SECRET`, sets `req.user = { id, role }`.

### `isAdmin`
Checks `req.user.role === 'admin'`. Returns 403 if not admin.

## 6. Business Logic

### Overlap Prevention (`bookingController.js`)
Before creating a booking, queries for any approved booking on the same `roomId` and `date` where `startTime < newEndTime AND endTime > newStartTime`. Returns 409 if overlap exists.

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
    middleware/
      auth.js            # verifyToken, isAdmin
    models/
      User.js            # User model
      Room.js            # Room model
      Booking.js         # Booking model + associations
    routes/
      auth.js            # /api/auth/*
      rooms.js           # /api/rooms/*
      bookings.js        # /api/bookings/*
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
```
