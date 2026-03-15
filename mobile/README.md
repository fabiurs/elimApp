# Elim Church Booking - Mobile App

A React Native (Expo) mobile app for the Church Booking System.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing on device)

## Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure API URL:**

   Edit `src/config/api.js` and set `API_BASE` to your backend server address:
   - **Android Emulator:** `http://10.0.2.2:5000`
   - **iOS Simulator:** `http://localhost:5000`
   - **Physical Device:** `http://<YOUR_LAN_IP>:5000` (e.g., `http://192.168.1.100:5000`)

   To find your LAN IP, run `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

3. **Start the backend** (from the project root):
   ```bash
   cd backend
   npm run dev
   ```

4. **Start the mobile app:**
   ```bash
   cd mobile
   npx expo start
   ```

   Then:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go for physical device

## Project Structure

```
mobile/
├── App.js                      # Entry point
├── app.json                    # Expo configuration
├── package.json
├── assets/                     # App icons & splash images
└── src/
    ├── config/
    │   ├── api.js              # API base URL
    │   └── theme.js            # Design tokens (colors, spacing)
    ├── context/
    │   └── AuthContext.js       # Auth state management
    ├── navigation/
    │   ├── RootNavigator.js     # Auth vs Main routing
    │   ├── AuthNavigator.js     # Login / Register stack
    │   └── MainNavigator.js     # Bottom tabs + room booking stack
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.js
    │   │   └── RegisterScreen.js
    │   ├── rooms/
    │   │   └── RoomsScreen.js   # Room gallery
    │   ├── booking/
    │   │   ├── BookRoomScreen.js       # Date & time picker
    │   │   ├── ConfirmBookingScreen.js # Booking confirmation
    │   │   └── MyBookingsScreen.js     # User's booking list
    │   ├── calendar/
    │   │   └── CalendarScreen.js       # Weekly calendar view
    │   ├── admin/
    │   │   └── AdminDashboardScreen.js # Approve/reject bookings
    │   └── profile/
    │       └── ProfileScreen.js        # User profile & logout
    └── services/
        └── api.js              # All API calls
```

## Features

- **Authentication:** Login & registration with JWT stored in AsyncStorage
- **Room Browsing:** List all rooms with images, capacity, and amenities
- **Booking Flow:** Select date → pick time slots → confirm booking
- **My Bookings:** View all your bookings with status indicators
- **Calendar:** Weekly calendar view showing all approved bookings
- **Admin Dashboard:** Approve/reject pending bookings (admin only)
- **Profile:** View profile info and sign out

## Design

Matches the web app's design tokens:
- Primary color: `#6366F1` (Indigo)
- Rounded cards with soft shadows
- Status badges (pending/approved/rejected)
- Bottom tab navigation with icons
