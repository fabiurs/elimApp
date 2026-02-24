import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AddRoomModal from './AddRoomModal';

// Dummy data for demo
const dummyBookings = [
  { id: 1, room: 'Main Sanctuary', user: 'John Doe', date: '2026-02-12', start: '09:00', end: '11:00', status: 'pending' },
  { id: 2, room: 'Youth Hall', user: 'Jane Smith', date: '2026-02-13', start: '14:00', end: '16:00', status: 'approved' },
];
const dummyEvents = [
  { id: 1, title: 'Prayer Meeting', room: 'Prayer Room', date: '2026-02-14', start: '18:00', end: '19:00' },
  { id: 2, title: 'Youth Gathering', room: 'Youth Hall', date: '2026-02-15', start: '17:00', end: '19:00' },
];
const dummyRooms = [
  { _id: '1', name: 'Main Sanctuary', capacity: 200 },
  { _id: '2', name: 'Youth Hall', capacity: 80 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [showAddRoom, setShowAddRoom] = useState(false);

  // Admin dashboard
  if (user && (user.isAdmin || user.email === 'admin@example.com')) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-6 mb-8">
          <button className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow transition-all" onClick={() => setShowAddRoom(true)}>+ Add Room</button>
        </div>
        <AddRoomModal open={showAddRoom} onClose={() => setShowAddRoom(false)} />
        <h2 className="text-xl font-bold text-slate-800 mb-4">Rooms</h2>
        <table className="w-full mb-8 bg-white rounded-2xl shadow p-4">
          <thead>
            <tr className="text-indigo-700">
              <th className="py-2 text-center">Name</th>
              <th className="py-2 text-center">Capacity</th>
              <th className="py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyRooms.map(room => (
              <tr key={room._id} className="border-b last:border-none">
                <td className="py-2 font-semibold text-center">{room.name}</td>
                <td className="py-2 text-center">{room.capacity}</td>
                <td className="py-2 text-center">
                  <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg mr-2">Edit</button>
                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Pending Booking Requests</h2>
        <table className="w-full mb-8 bg-white rounded-2xl shadow p-4">
          <thead>
            <tr className="text-indigo-700">
              <th className="py-2 text-center">Room</th>
              <th className="py-2 text-center">User</th>
              <th className="py-2 text-center">Date</th>
              <th className="py-2 text-center">Time</th>
              <th className="py-2 text-center">Status</th>
              <th className="py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyBookings.filter(b => b.status === 'pending').map(b => (
              <tr key={b.id} className="border-b last:border-none">
                <td className="py-2 text-center">{b.room}</td>
                <td className="py-2 text-center">{b.user}</td>
                <td className="py-2 text-center">{b.date}</td>
                <td className="py-2 text-center">{b.start} - {b.end}</td>
                <td className="py-2 text-center text-orange-600 font-bold">{b.status}</td>
                <td className="py-2">
                  <button className="bg-green-100 text-green-700 px-3 py-1 rounded-lg mr-2">Approve</button>
                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Calendar</h2>
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <ul>
            {dummyEvents.map(ev => (
              <li key={ev.id} className="mb-2">
                <span className="font-semibold text-indigo-700">{ev.title}</span> in <span className="text-slate-700">{ev.room}</span> on <span className="text-slate-500">{ev.date}</span> ({ev.start}-{ev.end})
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // User dashboard
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">My Dashboard</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-4">My Booking Requests</h2>
      <table className="w-full mb-8 bg-white rounded-2xl shadow p-4">
        <thead>
          <tr className="text-indigo-700">
            <th className="py-2 text-center">Room</th>
            <th className="py-2 text-center">Date</th>
            <th className="py-2 text-center">Time</th>
            <th className="py-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {dummyBookings.map(b => (
            <tr key={b.id} className="border-b last:border-none">
              <td className="py-2 text-center">{b.room}</td>
              <td className="py-2 text-center">{b.date}</td>
              <td className="py-2 text-center">{b.start} - {b.end}</td>
              <td className={`py-2 font-bold text-center ${b.status === 'approved' ? 'text-green-700' : b.status === 'pending' ? 'text-orange-600' : 'text-red-700'}`}>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Events</h2>
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <ul>
          {dummyEvents.map(ev => (
            <li key={ev.id} className="mb-2">
              <span className="font-semibold text-indigo-700">{ev.title}</span> in <span className="text-slate-700">{ev.room}</span> on <span className="text-slate-500">{ev.date}</span> ({ev.start}-{ev.end})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
