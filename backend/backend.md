# 🟢 Backend Technical Specification: Node.js Version
**Project:** Church Booking System (CBS)
**Stack:** Node.js, Express, MongoDB, JSON Web Tokens (JWT)

## 1. System Overview
This is the Node.js implementation of the CBS API. It handles asynchronous I/O operations for real-time booking management, user authentication, and administrative overrides.



## 2. Core Dependencies
- **Framework:** `express`
- **Database ODM:** `mongoose` (for schema validation)
- **Security:** `bcryptjs` (password hashing), `jsonwebtoken` (auth)
- **Middleware:** `cors`, `dotenv`, `helmet` (security headers)

## 3. Database Models (Mongoose)

### User Schema (`User.js`)
- `name`: String, required
- `email`: String, required, unique
- `password`: String, required (hashed)
- `role`: String, enum: ['user', 'admin'], default: 'user'

### Booking Schema (`Booking.js`)
- `userId`: ObjectId (ref: 'User')
- `roomId`: ObjectId (ref: 'Room')
- `date`: Date, required
- `startTime`: String (Format HH:mm)
- `endTime`: String (Format HH:mm)
- `status`: String, enum: ['pending', 'approved', 'rejected']
- `notes`: String

## 4. API Endpoints Strategy

| Method | Route | Description | Middleware |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User Signup | Public |
| `POST` | `/api/auth/login` | User Login | Public |
| `GET` | `/api/rooms` | Get All Rooms | `verifyToken` |
| `POST` | `/api/bookings` | Create Request | `verifyToken` |
| `GET` | `/api/admin/bookings` | View All Requests | `isAdmin` |
| `PATCH` | `/api/admin/bookings/:id`| Update Status | `isAdmin` |

## 5. Critical Logic (AI Implementation Rules)

### 5.1 Concurrency & Overlap Check
Before saving a booking with status `approved`, the system must execute a query to ensure no other booking exists for the same `roomId` and `date` where:
- New `startTime` is less than existing `endTime`
- New `endTime` is greater than existing `startTime`

### 5.2 Security (RBAC)
Implement two main middleware functions:
1. `verifyToken`: Validates the JWT in the `Authorization` header.
2. `isAdmin`: Checks if `req.user.role === 'admin'`.

## 6. Project Structure (Recommended)
```text
/src
  /config      # Database connection (db.js)
  /controllers # Request handlers
  /models      # Mongoose schemas
  /routes      # Express route definitions
  /middleware  # Auth and validation logic
  server.js    # Entry point