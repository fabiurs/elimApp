import React, { useState } from 'react';

const dummyRooms = [
  { _id: '1', name: 'Main Sanctuary' },
  { _id: '2', name: 'Youth Hall' },
  { _id: '3', name: 'Prayer Room' },
];
const dummyEvents = [
  { id: 1, roomId: '1', title: 'Sunday Service', date: '2026-02-15', start: '10:00', end: '12:00' },
  { id: 2, roomId: '2', title: 'Youth Gathering', date: '2026-02-16', start: '17:00', end: '19:00' },
  { id: 3, roomId: '1', title: 'Bible Study', date: '2026-02-17', start: '19:00', end: '20:30' },
  { id: 4, roomId: '3', title: 'Prayer Meeting', date: '2026-02-18', start: '18:00', end: '19:00' },
];

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
  const [selectedRoom, setSelectedRoom] = useState(dummyRooms[0]._id);
  const weekDates = getWeekDates();
  const events = dummyEvents.filter(ev => ev.roomId === selectedRoom);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">Room Calendar</h1>
      <div className="mb-6">
        <label className="font-bold text-slate-800 mr-4">Select Room:</label>
        <select
          value={selectedRoom}
          onChange={e => setSelectedRoom(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition"
        >
          {dummyRooms.map(room => (
            <option key={room._id} value={room._id}>{room.name}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-indigo-700 mb-4">Week View</h2>
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map(day => (
            <div key={day.key} className="flex flex-col border border-slate-200 rounded-xl p-2 min-h-[120px]">
              <div className="font-bold text-indigo-700 text-sm mb-1">{day.day}</div>
              <div className="text-slate-700 text-xs mb-2">{day.key}</div>
              {events.filter(ev => ev.date === day.key).length === 0 ? (
                <div className="text-slate-400 text-xs">No bookings</div>
              ) : (
                events.filter(ev => ev.date === day.key).map(ev => (
                  <div key={ev.id} className="bg-indigo-100 text-indigo-700 rounded-lg px-2 py-1 mb-1 text-xs font-semibold shadow">
                    <div>{ev.title}</div>
                    <div>{ev.start} - {ev.end}</div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
