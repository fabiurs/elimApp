import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../hooks/useRooms';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n) { return String(n).padStart(2, '0'); }

export default function Calendar() {
  const { token } = useAuth();
  const { rooms, loading: roomsLoading } = useRooms(token);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(String(rooms[0].id || rooms[0]._id));
    }
  }, [rooms]);

  useEffect(() => {
    async function fetchCalendarBookings() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch('/api/bookings/calendar', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchCalendarBookings();
  }, [token]);

  const filteredBookings = bookings.filter(
    b => String(b.roomId) === selectedRoom
  );

  // Build a lookup: "YYYY-MM-DD" -> bookings[]
  const bookingsByDate = useMemo(() => {
    const map = {};
    filteredBookings.forEach(b => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [filteredBookings]);

  // Calendar grid for the current month
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const cells = [];
    // leading blanks
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [year, month]);

  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }
  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()); }

  if (roomsLoading || loading) {
    return <p className="text-center text-slate-500 mt-10">Loading calendar...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">Room Calendar</h1>

      {/* Room selector */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="font-bold text-slate-800 mr-2">Room:</label>
          <select
            value={selectedRoom || ''}
            onChange={e => setSelectedRoom(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          >
            {rooms.map(room => (
              <option key={room.id || room._id} value={String(room.id || room._id)}>{room.name}</option>
            ))}
          </select>
        </div>

        {/* Year selector */}
        <div>
          <label className="font-bold text-slate-800 mr-2">Year:</label>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          >
            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - 1 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition">
          <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-indigo-700">{MONTH_NAMES[month]} {year}</h2>
          <button onClick={goToday} className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-lg font-semibold hover:bg-accent-200 transition">Today</button>
        </div>
        <button onClick={nextMonth} className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition">
          <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl shadow p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-bold text-indigo-600 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`blank-${i}`} className="min-h-[90px]" />;
            const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
            const dayBookings = bookingsByDate[dateKey] || [];
            const isToday = dateKey === todayKey;
            return (
              <div
                key={dateKey}
                className={`min-h-[90px] border rounded-xl p-1.5 flex flex-col transition-all ${isToday ? 'border-accent-400 bg-accent-50' : 'border-slate-200 hover:border-indigo-300'}`}
              >
                <div className={`text-xs font-bold mb-0.5 ${isToday ? 'text-accent-700' : 'text-indigo-700'}`}>
                  {day}
                </div>
                <div className="flex-1 overflow-y-auto max-h-[70px] space-y-0.5">
                  {dayBookings.map(b => (
                    <div key={b.id} className="bg-accent-100 text-accent-800 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight" title={`${b.title || ''} — ${b.startTime}-${b.endTime} ${b.notes || ''} — ${b.User?.name || b.User?.email || ''}`}>
                      <div className="truncate font-bold">{b.title || b.notes || b.Room?.name || 'Booking'}</div>
                      <div className="truncate text-accent-600">{b.User?.name || b.User?.email || '—'}</div>
                      <div className="text-accent-500">{b.startTime?.slice(0, 5)}-{b.endTime?.slice(0, 5)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
