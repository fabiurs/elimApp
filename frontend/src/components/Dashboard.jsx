import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../hooks/useRooms';
import { useBookings, useAdminBookings } from '../hooks/useBookings';
import AddRoomModal from './AddRoomModal';

export default function Dashboard() {
  const { user, token, isAdmin } = useAuth();
  const [showAddRoom, setShowAddRoom] = useState(false);

  const { rooms, loading: roomsLoading } = useRooms(token);
  const { bookings: userBookings, loading: userBookingsLoading } = useBookings(token);
  const { bookings: adminBookings, loading: adminBookingsLoading, updateStatus } = useAdminBookings(isAdmin ? token : null);

  // Admin dashboard
  if (isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-6 mb-8">
          <button className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow transition-all" onClick={() => setShowAddRoom(true)}>+ Add Room</button>
        </div>
        <AddRoomModal open={showAddRoom} onClose={() => setShowAddRoom(false)} />
        <h2 className="text-xl font-bold text-slate-800 mb-4">Rooms</h2>
        {roomsLoading ? (
          <p className="text-slate-500 mb-8">Loading rooms...</p>
        ) : (
        <table className="w-full mb-8 bg-white rounded-2xl shadow p-4">
          <thead>
            <tr className="text-indigo-700">
              <th className="py-2 text-center">Name</th>
              <th className="py-2 text-center">Capacity</th>
              <th className="py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id || room.id} className="border-b last:border-none">
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
        )}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Pending Booking Requests</h2>
        {adminBookingsLoading ? (
          <p className="text-slate-500 mb-8">Loading bookings...</p>
        ) : (
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
            {adminBookings.filter(b => b.status === 'pending').map(b => (
              <tr key={b.id} className="border-b last:border-none">
                <td className="py-2 text-center">{b.Room?.name || b.roomId}</td>
                <td className="py-2 text-center">{b.User?.name || b.User?.email || b.userId}</td>
                <td className="py-2 text-center">{b.date}</td>
                <td className="py-2 text-center">{b.startTime} - {b.endTime}</td>
                <td className="py-2 text-center text-orange-600 font-bold">{b.status}</td>
                <td className="py-2 text-center">
                  <button className="bg-green-100 text-green-700 px-3 py-1 rounded-lg mr-2" onClick={() => updateStatus(b.id, 'approved')}>Approve</button>
                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg" onClick={() => updateStatus(b.id, 'rejected')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        <h2 className="text-xl font-bold text-slate-800 mb-4">All Bookings</h2>
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          {adminBookingsLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : adminBookings.length === 0 ? (
            <p className="text-slate-500">No bookings yet.</p>
          ) : (
            <ul>
              {adminBookings.filter(b => b.status === 'approved').map(b => (
                <li key={b.id} className="mb-2">
                  <span className="font-semibold text-indigo-700">{b.Room?.name || b.roomId}</span> by <span className="text-slate-700">{b.User?.name || b.User?.email || b.userId}</span> on <span className="text-slate-500">{b.date}</span> ({b.startTime}-{b.endTime})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // User dashboard
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">My Dashboard</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-4">My Booking Requests</h2>
      {userBookingsLoading ? (
        <p className="text-slate-500 mb-8">Loading bookings...</p>
      ) : (
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
          {userBookings.length === 0 ? (
            <tr><td colSpan="4" className="py-4 text-center text-slate-500">No bookings yet.</td></tr>
          ) : userBookings.map(b => (
            <tr key={b.id} className="border-b last:border-none">
              <td className="py-2 text-center">{b.Room?.name || b.roomId}</td>
              <td className="py-2 text-center">{b.date}</td>
              <td className="py-2 text-center">{b.startTime} - {b.endTime}</td>
              <td className={`py-2 font-bold text-center ${b.status === 'approved' ? 'text-green-700' : b.status === 'pending' ? 'text-orange-600' : 'text-red-700'}`}>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}
