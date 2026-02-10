import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RoomGallery from './components/RoomGallery';
import TimePicker from './components/TimePicker';
import BookingSummary from './components/BookingSummary';
import { useBookings } from './hooks/useBookings';
import { useAuth } from './context/AuthContext.jsx';

function AppContent() {
  const [showLogin, setShowLogin] = useState(true);
  const [step, setStep] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [booking, setBooking] = useState(null);
  const { user, token } = useAuth();
  const { createBooking, loading, error } = useBookings(token);

  function handleRoomSelect(room) {
    if (!user) setShowLogin(true);
    else {
      setSelectedRoom(room);
      setStep(1);
    }
  }

  function handleTimeSelect({ date, start, end }) {
    setBooking({ room: selectedRoom, date, start, end });
    setStep(2);
  }

  async function handleConfirm() {
    await createBooking({
      roomId: booking.room._id,
      date: booking.date,
      startTime: booking.start,
      endTime: booking.end,
    });
    setStep(3);
  }

  function handleReset() {
    setStep(0);
    setSelectedRoom(null);
    setBooking(null);
  }

  return (
    <>
      <Navbar onLogin={() => setShowLogin(true)} />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      <div className="min-h-screen bg-slate-50 p-4">
        {step === 0 && <RoomGallery token={token} onSelect={handleRoomSelect} />}
        {step === 1 && selectedRoom && (
          <TimePicker bookedSlots={[]} onSelect={handleTimeSelect} />
        )}
        {step === 2 && booking && (
          <BookingSummary room={booking.room} date={booking.date} start={booking.start} end={booking.end} onConfirm={handleConfirm} />
        )}
        {step === 3 && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-12 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">Booking Confirmed!</h3>
            <button onClick={handleReset} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl shadow transition">Book Another</button>
          </div>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
