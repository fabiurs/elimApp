import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  {
    icon: (
      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M9 14h6M9 18h6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Easy Room Booking',
    description:
      'Browse all available church rooms, check real-time availability, and reserve your preferred slot in just a few clicks.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Calendar Overview',
    description:
      'View all upcoming bookings in a clear monthly calendar. Never double-book a space again.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6M3 21h18M12 3L3 9h18L12 3z" />
      </svg>
    ),
    title: 'Personal Dashboard',
    description:
      'Track all your past and upcoming bookings from a single personalised dashboard. Cancel or update with ease.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
      </svg>
    ),
    title: 'Admin Management',
    description:
      'Administrators can approve or reject booking requests, add or edit rooms, and oversee all activity across the system.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure & Private',
    description:
      'JWT-based authentication keeps every booking private. Only authorised members can view or create reservations.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'Instant Notifications',
    description:
      'Receive on-platform confirmations when your booking is approved, giving you peace of mind every time.',
  },
];

export default function LandingPage({ onLogin }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/rooms');
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-8 py-4 z-20 rounded-b-2xl border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-2xl text-indigo-600 tracking-tight">CBS</span>
          <span className="ml-2 text-slate-800 font-semibold text-lg hidden sm:inline">
            Church Room Booking System
          </span>
        </div>
        <button
          onClick={handleCTA}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl shadow transition-all"
        >
          {user ? 'Go to App' : 'Sign In'}
        </button>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 max-w-3xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full">
          <span>✦</span> Elim Church &mdash; Room Booking System
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
          Reserve the right&nbsp;
          <span className="text-indigo-600">space</span>&nbsp;at the right&nbsp;
          <span className="text-indigo-600">time</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-xl">
          A simple, centralised platform for Elim Church members to discover available rooms, book
          time slots, and manage reservations&nbsp;&mdash;&nbsp;all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCTA}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-4 rounded-2xl shadow-lg text-lg transition-all"
          >
            {user ? 'Browse Rooms' : 'Get Started'}
          </button>
          <a
            href="#features"
            className="border-2 border-indigo-200 text-indigo-700 font-bold px-10 py-4 rounded-2xl text-lg hover:border-indigo-400 transition-all"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-3">
          Everything you need
        </h2>
        <p className="text-slate-400 text-center mb-12 text-lg">
          From booking to administration, CBS handles it all.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <div className="bg-indigo-600 rounded-3xl px-10 py-14 shadow-xl">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to book your first room?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Sign in with your church account and get started in under a minute.
          </p>
          <button
            onClick={handleCTA}
            className="bg-white text-indigo-700 font-extrabold px-10 py-4 rounded-2xl shadow text-lg hover:bg-indigo-50 transition-all"
          >
            {user ? 'Go to App' : 'Sign In Now'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-sm py-8 border-t border-slate-100">
        &copy; {new Date().getFullYear()} Elim Church &mdash; Church Room Booking System
      </footer>
    </div>
  );
}
