import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import RoomGallery from './components/RoomGallery';
import TimePicker from './components/TimePicker';
import BookingSummary from './components/BookingSummary';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard.jsx';
import Calendar from './components/Calendar.jsx';
import { useBookings } from './hooks/useBookings';

function Home({ onSelectRoom }) {
  const { token } = useAuth();
  return <RoomGallery token={token} onSelect={onSelectRoom} />;
}

function BookingPage({ selectedRoom, onTimeSelected }) {
  const { token } = useAuth();
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Fetch approved bookings for this room + date and convert to slot keys
  useEffect(() => {
    async function fetchBooked() {
      if (!token || !selectedRoom) return;
      try {
        const res = await fetch('/api/bookings/calendar', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!Array.isArray(data)) { setBookedSlots([]); return; }
        const roomId = String(selectedRoom.id || selectedRoom._id);
        const dayBookings = data.filter(
          b => String(b.roomId) === roomId && b.date === selectedDate
        );
        // Convert each booking's startTime-endTime range into 30-min slot keys
        const slots = [];
        for (const b of dayBookings) {
          const [sh, sm] = b.startTime.split(':').map(Number);
          const [eh, em] = b.endTime.split(':').map(Number);
          let mins = sh * 60 + sm;
          const endMins = eh * 60 + em;
          while (mins < endMins) {
            const h = Math.floor(mins / 60).toString().padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            slots.push(`${h}:${m}`);
            mins += 30;
          }
        }
        setBookedSlots(slots);
      } catch {
        setBookedSlots([]);
      }
    }
    fetchBooked();
  }, [token, selectedRoom, selectedDate]);

  if (!selectedRoom) {
    return <p className="text-center text-slate-500 mt-10">Please select a room first.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-extrabold text-indigo-700 mb-2">Book: {selectedRoom.name}</h1>
      <p className="text-slate-500 mb-4">Select a date and time slot below.</p>
      <TimePicker bookedSlots={bookedSlots} onSelect={onTimeSelected} onDateChange={setSelectedDate} />
    </div>
  );
}

function SummaryPage({ selectedRoom, bookingTime, onConfirmed }) {
  const { token } = useAuth();
  const { createBooking, loading, error } = useBookings(token);
  const navigate = useNavigate();

  if (!selectedRoom || !bookingTime) {
    return <p className="text-center text-slate-500 mt-10">No booking to confirm.</p>;
  }

  const handleConfirm = async () => {
    const result = await createBooking({
      roomId: selectedRoom.id || selectedRoom._id,
      date: bookingTime.date,
      startTime: bookingTime.start,
      endTime: bookingTime.end,
    });
    if (result && !result.error && !result.message) {
      onConfirmed();
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-extrabold text-indigo-700 mb-6">Confirm Your Booking</h1>
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="mb-2"><span className="font-bold text-slate-700">Room:</span> {selectedRoom.name}</p>
        <p className="mb-2"><span className="font-bold text-slate-700">Date:</span> {bookingTime.date}</p>
        <p className="mb-2"><span className="font-bold text-slate-700">Time:</span> {bookingTime.start} - {bookingTime.end}</p>
      </div>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow transition-all text-lg mt-6 w-full"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </div>
  );
}

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const { loading, user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="text-indigo-600 text-xl font-bold animate-pulse">Loading...</span>
      </div>
    );
  }

  // If not logged in, force login modal and block app content
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <span className="font-extrabold text-3xl text-indigo-700 mb-4">Church Booking System</span>
        <span className="text-slate-500 text-lg mb-8">Sign in to continue</span>
        <LoginModal open={true} onClose={() => {}} />
      </div>
    );
  }

  return (
    <>
      <Navbar onLogin={() => setShowLogin(true)} />
      <Routes>
        <Route path="/" element={<HomeWithNav onSelectRoom={setSelectedRoom} />} />
        <Route path="/booking" element={<BookingPage selectedRoom={selectedRoom} onTimeSelected={setBookingTime} />} />
        <Route path="/summary" element={<SummaryPage selectedRoom={selectedRoom} bookingTime={bookingTime} onConfirmed={() => { setSelectedRoom(null); setBookingTime(null); }} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

function HomeWithNav({ onSelectRoom }) {
  const navigate = useNavigate();
  const handleSelect = (room) => {
    onSelectRoom(room);
    navigate('/booking');
  };
  return <Home onSelectRoom={handleSelect} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
