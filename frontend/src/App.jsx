import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
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
  return <TimePicker bookedSlots={[]} onSelect={() => {}} />;
}

function Summary() {
  return <BookingSummary room={{ name: 'Demo Room' }} date={'2026-02-11'} start={'09:00'} end={'10:00'} onConfirm={() => {}} />;
}

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const { loading, user } = useAuth();

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
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
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
