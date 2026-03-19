import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { apiUrl } from './utils/api';
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
        const res = await fetch(apiUrl('/api/bookings/calendar'), {
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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-extrabold text-indigo-600 mb-1">Book: {selectedRoom.name}</h1>
      <p className="text-slate-500 text-sm mb-6">Select a date and time slot below.</p>
      <TimePicker bookedSlots={bookedSlots} onSelect={onTimeSelected} onDateChange={setSelectedDate} />
    </div>
  );
}

function SummaryPage({ selectedRoom, bookingTime, onConfirmed }) {
  const { token } = useAuth();
  const { createBooking, loading, error } = useBookings(token);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  if (!selectedRoom || !bookingTime) {
    return <p className="text-center text-slate-500 mt-10">No booking to confirm.</p>;
  }

  const handleConfirm = async () => {
    const result = await createBooking({
      roomId: selectedRoom.id || selectedRoom._id,
      date: bookingTime.date,
      startTime: bookingTime.start,
      endTime: bookingTime.end,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    if (result && !result.error && !result.message) {
      onConfirmed();
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold text-indigo-600 mb-6">Confirm Your Booking</h1>
      <div className="bg-white rounded-xl shadow-card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Room</p>
            <p className="font-bold text-slate-800">{selectedRoom.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Date</p>
            <p className="font-bold text-slate-800">{bookingTime.date}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Time</p>
            <p className="font-bold text-slate-800">{bookingTime.start} – {bookingTime.end}</p>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-sm">Booking Title <span className="text-slate-400 font-normal">(required)</span></label>
            <input
              type="text"
              placeholder="e.g. Youth Group Meeting"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-accent-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-sm">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              placeholder="Any additional details..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-accent-200 outline-none transition resize-none"
            />
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
      <button
        className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-8 py-3 rounded-lg shadow transition-all duration-200 text-base w-full disabled:opacity-50"
        onClick={handleConfirm}
        disabled={loading || !title.trim()}
      >
        {loading ? 'Booking…' : 'Confirm Booking'}
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <span className="text-indigo-600 text-xl font-bold animate-pulse">Loading…</span>
      </div>
    );
  }

  // If not logged in, force login modal and block app content
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-600">
        <div className="mb-10 text-center">
          <div className="text-4xl font-extrabold text-white tracking-tight mb-2">Church Booking System</div>
          <div className="text-white/60 text-base">Reserve rooms for your community events.</div>
        </div>
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
