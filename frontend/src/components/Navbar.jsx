import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onLogin }) {
  const { user, logout } = useAuth();
  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-8 py-4 z-20 rounded-b-2xl border-b border-slate-100">
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-2xl text-indigo-600 tracking-tight">CBS</span>
        <span className="ml-2 text-slate-800 font-semibold text-lg hidden sm:inline">Church Booking System</span>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-slate-700 font-medium bg-slate-100 px-3 py-1 rounded-xl">{user.name}</span>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow transition-all" onClick={logout}>Logout</button>
          </>
        ) : (
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow transition-all" onClick={onLogin}>Sign In</button>
        )}
      </div>
    </nav>
  );
}
