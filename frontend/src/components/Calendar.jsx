import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl } from '../utils/api';
import { useRooms } from '../hooks/useRooms';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// 06:00 → 22:00 in 30-min increments
const TIME_SLOTS = Array.from({ length: (22 - 6) * 2 + 1 }, (_, i) => {
  const totalMin = 6 * 60 + i * 30;
  return `${String(Math.floor(totalMin / 60)).padStart(2,'0')}:${String(totalMin % 60).padStart(2,'0')}`;
});

function slotOverlaps(slotStart, bookedRanges) {
  const [h, m] = slotStart.split(':').map(Number);
  const totalMin = h * 60 + m + 30;
  const slotEnd = `${String(Math.floor(totalMin / 60)).padStart(2,'0')}:${String(totalMin % 60).padStart(2,'0')}`;
  return bookedRanges.some(b => b.startTime < slotEnd && b.endTime > slotStart);
}

// ─── Inline booking form ────────────────────────────────────────────────────
function BookRoomForm({ room, dateKey, bookedRanges, token, onBooked, onCancel }) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!startTime || !endTime) return setError('Please select start and end times.');
    if (endTime <= startTime) return setError('End time must be after start time.');
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: room.id || room._id,
          date: dateKey,
          startTime,
          endTime,
          title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setSuccess(true);
      setTimeout(() => onBooked(), 1400);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 text-center text-green-600 font-bold py-2 animate-fadeIn">
        ✓ Booking requested — pending approval.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
      <div>
        <label className="text-xs font-semibold text-slate-600">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Team standup…"
          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 outline-none"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-600">Start</label>
          <select
            value={startTime}
            onChange={e => { setStartTime(e.target.value); setEndTime(''); }}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 outline-none"
          >
            <option value="">--</option>
            {TIME_SLOTS.slice(0, -1).map(s => (
              <option key={s} value={s} disabled={slotOverlaps(s, bookedRanges)}>
                {s}{slotOverlaps(s, bookedRanges) ? ' (booked)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-600">End</label>
          <select
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 outline-none"
          >
            <option value="">--</option>
            {TIME_SLOTS.filter(s => !startTime || s > startTime).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50"
        >
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Day detail side panel ──────────────────────────────────────────────────
function DayPanel({ dateKey, rooms, allBookings, token, onClose, onBooked }) {
  const [bookingRoomId, setBookingRoomId] = useState(null);

  const bookingsForDay = allBookings.filter(b => b.date === dateKey);

  const dateObj = new Date(dateKey + 'T00:00:00');
  const label = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const isPast = dateKey < todayKey;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col animate-slideInRight"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-extrabold text-indigo-700">
              {isPast ? 'Room Bookings' : 'Available Rooms'}
            </h2>
            <p className="text-slate-500 text-sm">{label}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Past day notice */}
        {isPast && (
          <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2 text-sm font-semibold">
            This day has passed. Bookings shown for reference only.
          </div>
        )}

        {/* Room list */}
        <div className="flex-1 p-5 space-y-4">
          {rooms.length === 0 && (
            <p className="text-slate-500 text-sm">No rooms configured.</p>
          )}

          {rooms.map(room => {
            const roomId = String(room.id || room._id);
            const roomBookings = bookingsForDay.filter(b => String(b.roomId) === roomId);
            const isExpanded = bookingRoomId === roomId;

            return (
              <div
                key={roomId}
                className={`rounded-2xl border-2 p-4 transition-all ${
                  isExpanded ? 'border-indigo-400 shadow-md' : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                {/* Room info */}
                <div className="flex items-start gap-3">
                  {room.image_url && (
                    <img src={room.image_url} alt={room.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-extrabold text-indigo-900 truncate">{room.name}</h3>
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-semibold flex-shrink-0">
                        Cap: {room.capacity}
                      </span>
                    </div>

                    {room.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {room.amenities.map((a, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{a}</span>
                        ))}
                      </div>
                    )}

                    {roomBookings.length > 0 ? (
                      <div className="mt-1.5">
                        <p className="text-xs font-semibold text-slate-500 mb-0.5">Approved bookings:</p>
                        <div className="flex flex-wrap gap-1">
                          {roomBookings.map(b => (
                            <span key={b.id} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium" title={b.title || b.notes || ''}>
                              {b.startTime?.slice(0,5)}–{b.endTime?.slice(0,5)}{(b.title || b.notes) ? ` · ${b.title || b.notes}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 font-semibold mt-1">✓ Available all day</p>
                    )}
                  </div>
                </div>

                {/* Book button / form */}
                {!isPast && (
                  !isExpanded ? (
                    <button
                      onClick={() => setBookingRoomId(roomId)}
                    className="mt-3 w-full bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-4 py-2 rounded-lg text-sm transition-all duration-200"
                    >
                      Book this room
                    </button>
                  ) : (
                    <BookRoomForm
                      room={room}
                      dateKey={dateKey}
                      bookedRanges={roomBookings}
                      token={token}
                      onBooked={() => { setBookingRoomId(null); onBooked(); }}
                      onCancel={() => setBookingRoomId(null)}
                    />
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Calendar ──────────────────────────────────────────────────────────
export default function Calendar() {
  const { token } = useAuth();
  const { rooms, loading: roomsLoading } = useRooms(token);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD" or null

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/bookings/calendar'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // date → bookings[]
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [year, month]);

  function pad(n) { return String(n).padStart(2, '0'); }
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
    return <p className="text-center text-slate-500 mt-10">Loading calendar…</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <h1 className="text-3xl font-extrabold text-indigo-600 mb-1">Room Calendar</h1>
      <p className="text-slate-500 text-sm mb-6">Click any day to view available rooms and make a booking.</p>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={prevMonth}
          className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition"
        >
          <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-2xl font-extrabold text-indigo-700">{MONTH_NAMES[month]} {year}</h2>
          <button onClick={goToday} className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-lg font-semibold hover:bg-accent-200 transition">
            Today
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition"
        >
          <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl shadow p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-bold text-indigo-600 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`blank-${i}`} className="min-h-[80px]" />;
            const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
            const dayBookings = bookingsByDate[dateKey] || [];
            const isToday = dateKey === todayKey;
            const isSelected = selectedDay === dateKey;
            const isPast = dateKey < todayKey;

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDay(dateKey)}
                className={`
                  min-h-[56px] sm:min-h-[80px] border-2 rounded-xl p-1 sm:p-1.5 flex flex-col cursor-pointer transition-all select-none
                  ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.03]' : ''}
                  ${isToday && !isSelected ? 'border-accent-400 bg-accent-50' : ''}
                  ${!isToday && !isSelected ? 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50' : ''}
                `}
              >
                <div className={`text-[10px] sm:text-xs font-bold mb-0.5 ${isToday ? 'text-accent-700' : isPast ? 'text-slate-400' : 'text-indigo-700'}`}>
                  {day}
                </div>
                {dayBookings.length > 0 && (
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayBookings.slice(0, 2).map(b => (
                      <div key={b.id} className="bg-accent-100 text-accent-800 rounded px-1 text-[9px] font-semibold truncate leading-tight py-0.5">
                        {b.startTime?.slice(0, 5)} {b.Room?.name || ''}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-semibold pl-0.5">
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded border-2 border-accent-400 bg-accent-50" />Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded border-2 border-indigo-500 bg-indigo-50" />Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-accent-100" />Has bookings
        </span>
        <span className="italic text-slate-400">Click a day to see rooms &amp; book</span>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <DayPanel
          dateKey={selectedDay}
          rooms={rooms}
          allBookings={bookings}
          token={token}
          onClose={() => setSelectedDay(null)}
          onBooked={() => { fetchBookings(); setSelectedDay(null); }}
        />
      )}
    </div>
  );
}
