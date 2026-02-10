# ⛪ Church Booking System (CBS) - Technical Specification

**Version:** 1.1  
**Project Goal:** A high-end reservation platform for church facilities featuring a modern, Dribbble-inspired UI.

---

## 1. System Architecture
The application follows a decoupled architecture using a fast asynchronous backend and a reactive frontend.



* **Frontend:** React.js + Tailwind CSS + Framer Motion.
* **Backend:** FastAPI (Python 3.10+) utilizing `Asyncio`.
* **Database:** MongoDB (NoSQL) for flexible event metadata.
* **Authentication:** JWT (JSON Web Tokens) with `OAuth2PasswordBearer`.

---

## 2. Data Models (Schemas)

### 2.1 Users (`users`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `name` | String | Full name of the user |
| `email` | String | Unique email (login) |
| `password_hash` | String | Bcrypt hashed password |
| `role` | Enum | `user` or `admin` |

### 2.2 Rooms (`rooms`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `name` | String | e.g., "Main Sanctuary", "Hall A" |
| `capacity` | Integer | Max occupancy |
| `amenities` | Array | e.g., ["Piano", "Projector"] |
| `image_url` | String | Visual preview of the room |

### 2.3 Bookings (`bookings`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | ObjectId | Link to User |
| `room_id` | ObjectId | Link to Room |
| `date` | String | ISO Format `YYYY-MM-DD` |
| `start_time` | String | `HH:MM` |
| `end_time` | String | `HH:MM` |
| `status` | Enum | `pending`, `approved`, `rejected` |
| `notes` | String | User comments |

---

## 3. API Endpoints

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Account creation |
| `POST` | `/auth/login` | Public | Returns JWT token |
| `GET` | `/rooms` | Auth | Get list of church spaces |
| `POST` | `/bookings` | User | Submit a request |
| `GET` | `/admin/bookings` | Admin | Review all pending/history |
| `PATCH` | `/admin/bookings/{id}` | Admin | Approve or Reject a request |

---

## 4. Core Business Logic & Constraints

1.  **Concurrency Control:** To prevent double-bookings, the system must check for overlapping time ranges on the same `room_id` and `date` where `status == "approved"`.
2.  **Unique Index:** Apply a compound index in MongoDB: `{ "room_id": 1, "date": 1, "start_time": 1 }`.
3.  **Validation:** `end_time` must be strictly greater than `start_time`.
4.  **RBAC:** Admin routes must be protected by a dependency that verifies `role == "admin"`.

---

## 5. UI/UX Requirements (Dribbble Style)
Inspired by modern meeting room apps, the interface should focus on:
* **Visual Room Selection:** High-quality cards with soft shadows and rounded corners (`2xl`).
* **Interactive Timeline:** A `ScheduleGrid` component allowing users to tap/click time blocks.
* **Floating Summary:** A sidebar or bottom sheet that updates in real-time as the user selects a slot.
* **Animations:** Use Framer Motion for layout transitions and "Spring" physics for modals.

---

## 6. Implementation Roadmap
1.  **Init:** Setup FastAPI project structure and MongoDB connection via `Motor`.
2.  **Auth:** Implement JWT flow and User models.
3.  **Booking Engine:** Create the logic for checking overlaps and handling CRUD.
4.  **Frontend:** Build the Room Gallery and the interactive Time-Slot Picker.