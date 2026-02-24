import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../hooks/useRooms';

function getWeekDates() {
  const today = new Date();
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    week.push({
      key: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      full: d,
    });
  }
  return week;
}

export default function Calendar() {
  const { token } = useAuth();
  const { rooms, loading: roomsLoading } = useRooms(token);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const weekDates = getWeekDates();

  // Set default room once rooms load
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(String(rooms[0].id || rooms[0]._id));
    }
  }, [rooms]);

  // Fetch approved bookings for calendar
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

  if (roomsLoading || loading) {
    return <p className="text-center text-slate-500 mt-10">Loading calendar...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">Room Calendar</h1>
      <div className="mb-6">
        <label className="font-bold text-slate-800 mr-4">Select Room:</label>
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
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-indigo-700 mb-4">Week View</h2>
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map(day => {
            const dayBookings = filteredBookings.filter(b => b.date === day.key);
            return (
              <div key={day.key} className="flex flex-col border border-slate-200 rounded-xl p-2 min-h-[120px]">
                <div className="font-bold text-indigo-700 text-sm mb-1">{day.day}</div>
                <div className="text-slate-700 text-xs mb-2">{day.key}</div>
                {dayBookings.length === 0 ? (
                  <div className="text-slate-400 text-xs">No bookings</div>
                ) : (
                  dayBookings.map(b => (
                    <div key={b.id} className="bg-indigo-100 text-indigo-700 rounded-lg px-2 py-1 mb-1 text-xs font-semibold shadow">
                      <div>{b.notes || b.Room?.name || 'Booking'}</div>
                      <div>{b.startTime} - {b.endTime}</div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
