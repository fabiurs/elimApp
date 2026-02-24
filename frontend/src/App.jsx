import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import RoomGallery from './components/RoomGallery';
import TimePicker from './components/TimePicker';
import BookingSummary from './components/BookingSummary';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard.jsx';
import Calendar from './components/Calendar.jsx';

function Home() {
  return <RoomGallery token={null} onSelect={() => {}} />;
}

function Booking() {
  // Example booking page, you can expand this logic
  return <TimePicker bookedSlots={[]} onSelect={() => {}} />;
}

function Summary() {
  // Example summary page, you can expand this logic
  return <BookingSummary room={{ name: 'Demo Room' }} date={'2026-02-11'} start={'09:00'} end={'10:00'} onConfirm={() => {}} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
        <LoginModal open={false} onClose={() => {}} />
      </Router>
    </AuthProvider>
  );
}
