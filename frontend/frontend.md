# 🚀 Getting Started: Running the Church Booking System

## 1. Backend Setup
1. Navigate to the backend folder:
   ```powershell
   cd ../backend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Create a `.env` file in the backend root with the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the backend server:
   ```powershell
   npm start
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000).

## 2. Frontend Setup
1. Navigate to the frontend folder:
   ```powershell
   cd ../frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the frontend app:
   ```powershell
   npm run dev
   ```
   The frontend will run on [http://localhost:5173](http://localhost:5173) by default.

## 3. Usage
- Open the frontend URL in your browser.
- Register or log in to book rooms.
- Admin users can access the admin dashboard to approve/reject bookings.

---

# 🎨 Frontend Specification: Church Booking System
**Version:** 1.0  
**Framework:** React.js (Vite) + Tailwind CSS  
**Design Theme:** Dribbble-inspired (Clean, High-end, Professional)

---

## How to Run the Church Booking System (CBS)

### Backend (Node.js/Express)
1. Ensure MongoDB is running and set your connection string in `.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/cbs
   JWT_SECRET=your_jwt_secret
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh
   node server.js
   ```
   The API will be available at `http://localhost:5000`.

### Frontend (React)
1. Install frontend dependencies:
   ```sh
   npm install
   ```
2. Start the frontend app:
   ```sh
   npm start
   ```
   The app will be available at `http://localhost:3000`.

### Usage
- Register or log in as a user to book rooms.
- Admin users can review and approve/reject bookings via the admin dashboard.

---

## 1. Project Setup & UI Kit
To achieve the modern aesthetic, the following styling principles must be applied:

### Design Tokens
- **Primary Color:** `#6366F1` (Indigo/Violet)
- **Secondary Color:** `#F8FAFC` (Slate 50 - Background)
- **Text:** `#1E293B` (Slate 800 - Headlines), `#64748B` (Slate 500 - Body)
- **Border Radius:** `1.5rem` (24px) for cards, `0.75rem` (12px) for buttons.
- **Shadows:** Soft `box-shadow: 0 4px 20px rgba(0,0,0,0.05)`.

### Key Libraries
- **Styling:** `tailwindcss`
- **Animations:** `framer-motion` (for page transitions and modal pops)
- **Icons:** `lucide-react`
- **State Management:** `Context API` or `Zustand`
- **Date Handling:** `date-fns`

---

## 2. Component Architecture

### 2.1 Navigation & Auth
- **`Navbar.jsx`**: Sticky header with blur effect (`backdrop-blur-md`). Contains brand logo, navigation links, and a dynamic auth button (Login vs. User Profile).
- **`LoginModal.jsx`**: Animated overlay with floating labels. 
  - *Logic:* Triggered by clicking "Sign In" or an unauthorized "Book Now" action.



### 2.2 Booking Flow (Dribbble Style)
- **`RoomGallery.jsx`**: A grid of `RoomCard` components.
  - *Feature:* Displays capacity, amenities, and a "Select" button.
- **`TimePicker.jsx`**: A horizontal date scroller combined with a vertical time timeline.
  - *Feature:* Drag-to-select time slots with real-time duration calculation.
- **`BookingSummary.jsx`**: A floating sidebar or bottom sheet that summarizes the selected slot and estimated approval time.



---

## 3. Page Structure
1. **Home / Landing:** Introduction to the church spaces and CTA to explore rooms.
2. **Dashboard (User):** View status of current bookings (Pending, Approved, Rejected).
3. **Admin Panel:** Table-based view for admins to manage requests with "Approve" and "Reject" buttons.

---

## 4. Frontend-Backend Integration (API)

| Hook / Function | Endpoint | Purpose |
| :--- | :--- | :--- |
| `useAuth()` | `/api/auth/login` | Manages JWT storage and user session. |
| `useRooms()` | `/api/rooms` | Fetches list of available spaces. |
| `useBookings()` | `/api/bookings` | Handles POST requests for new reservations. |

---

## 5. UI Logic & Micro-interactions (For AI Agent)
- **Input Validation:** Use immediate feedback for email formats and password strength.
- **Optimistic UI:** When an admin approves a booking, update the status locally before the server responds for a "snappy" feel.
- **Loading States:** Use "Skeleton Screens" instead of spinners for the Room Gallery.
- **Responsive Design:** - Mobile: Full-width cards and bottom-sheet drawers.
  - Desktop: Multi-column layouts with persistent sidebars.

---

## 6. Implementation Steps
1. **Phase 1:** Setup Tailwind configuration and Global Theme.
2. **Phase 2:** Build the `AuthContext` and Login Modal.
3. **Phase 3:** Develop the `TimePicker` component with selection logic.
4. **Phase 4:** Connect to the Node.js API and implement Admin Dashboard.