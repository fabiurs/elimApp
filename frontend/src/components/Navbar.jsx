import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AddRoomModal from './AddRoomModal';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onLogin }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/rooms',     label: 'Rooms'     },
    { to: '/events',    label: 'Events'    },
    { to: '/profile',   label: 'Profile'   },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/calendar',  label: 'Calendar'  },
  ];

  return (
    <nav className="sticky top-0 z-20 bg-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-0 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="font-extrabold text-xl text-white tracking-tight hover:opacity-80">Elim</Link>
            <span className="hidden sm:block text-white/60 font-medium text-sm border-l border-white/20 pl-2.5">
              Church Workflow
            </span>
          </div>

          {/* Nav links — desktop */}
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

        <div className="flex items-center gap-2">
          {/* Auth — desktop */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-white/70 text-sm font-medium">{user.name}</span>
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

          {/* Hamburger — mobile */}
          <button
            className="sm:hidden p-2 rounded-lg text-white hover:bg-white/10 transition"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-indigo-700 border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  active ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-2 pt-2 border-t border-white/10">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">{user.name}</span>
                <button
                  className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-4 py-1.5 rounded-lg text-sm shadow transition-all duration-200"
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="w-full bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-5 py-2.5 rounded-lg text-sm shadow transition-all duration-200"
                onClick={() => { onLogin(); setMobileOpen(false); }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
