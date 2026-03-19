import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AddRoomModal from './AddRoomModal';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onLogin }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showAddRoom, setShowAddRoom] = useState(false);

  const navLinks = [
    { to: '/',          label: 'Rooms'     },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/calendar',  label: 'Calendar'  },
  ];

  return (
    <nav className="sticky top-0 z-20 bg-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-0 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-xl text-white tracking-tight">CBS</span>
            <span className="hidden sm:block text-white/60 font-medium text-sm border-l border-white/20 pl-2.5">
              Church Room Booking
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-white/70 text-sm font-medium hidden sm:block">{user.name}</span>
              <button
                className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-4 py-1.5 rounded-lg text-sm shadow transition-all duration-200"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-5 py-2 rounded-lg text-sm shadow transition-all duration-200"
              onClick={onLogin}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
