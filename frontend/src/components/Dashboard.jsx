import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../hooks/useRooms';
import { useBookings, useAdminBookings } from '../hooks/useBookings';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const statusStyles = {
  pending: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const { user, token, isAdmin } = useAuth();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState({ rooms: true, pending: true, events: true, myBookings: true });

  const { rooms, loading: roomsLoading, updateRoom, deleteRoom } = useRooms(token);
  const { bookings: userBookings, loading: userBookingsLoading } = useBookings(token);
  const { bookings: adminBookings, loading: adminBookingsLoading, updateStatus } = useAdminBookings(isAdmin ? token : null);

  async function handleDelete(room) {
    if (!window.confirm(`Delete room "${room.name}"? This cannot be undone.`)) return;
    try {
      await deleteRoom(room.id || room._id);
    } catch (err) {
      alert(err.message || 'Failed to delete room');
    }
  }

  function toggleSection(key) {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function SectionHeader({ id, title, count }) {
    const isOpen = !collapsed[id];
    return (
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center gap-2 w-full text-left mb-4 group"
      >
        <svg
          className={`w-5 h-5 text-indigo-600 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        {count !== undefined && (
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </button>
    );
  }

  // Admin dashboard
  if (isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-6 mb-8">
          <button className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow transition-all" onClick={() => setShowAddRoom(true)}>+ Add Room</button>
        </div>
        <AddRoomModal open={showAddRoom} onClose={() => setShowAddRoom(false)} />
        <EditRoomModal open={!!editingRoom} onClose={() => setEditingRoom(null)} room={editingRoom} onSave={updateRoom} />
        <SectionHeader id="rooms" title="Rooms" count={rooms.length} />
        {!collapsed.rooms && (
        <>
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
                  <button className="bg-accent-100 text-accent-700 px-3 py-1 rounded-lg mr-2" onClick={() => setEditingRoom(room)}>Edit</button>
                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg" onClick={() => handleDelete(room)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        </>
        )}
        <SectionHeader id="pending" title="Pending Booking Requests" count={adminBookings.filter(b => b.status === 'pending').length} />
        {!collapsed.pending && (
        <>
        {adminBookingsLoading ? (
          <p className="text-slate-500 mb-8">Loading bookings...</p>
        ) : (
        <table className="w-full mb-8 bg-white rounded-2xl shadow p-4">
          <thead>
            <tr className="text-indigo-700">
              <th className="py-2 text-center">Title</th>
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
                <td className="py-2 text-center font-semibold">{b.title || '—'}</td>
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
        </>
        )}
        <SectionHeader id="events" title="All Events" count={adminBookings.length} />
        {!collapsed.events && (
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            {/* Status filter tabs */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 text-sm font-semibold capitalize transition-all ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}
                >
                  {s === 'all' ? 'All' : s}
                  {s !== 'all' && (
                    <span className="ml-1 text-xs opacity-75">
                      ({adminBookings.filter(b => b.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            {/* Room filter */}
            <select
              value={roomFilter}
              onChange={e => setRoomFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none"
            >
              <option value="all">All Rooms</option>
              {rooms.map(r => (
                <option key={r.id || r._id} value={r.id || r._id}>{r.name}</option>
              ))}
            </select>
            {/* Search */}
            <input
              type="text"
              placeholder="Search user or room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none flex-1 min-w-[180px]"
            />
          </div>
          {adminBookingsLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : (() => {
            const filtered = adminBookings
              .filter(b => statusFilter === 'all' || b.status === statusFilter)
              .filter(b => roomFilter === 'all' || String(b.roomId) === roomFilter || String(b.Room?.id) === roomFilter)
              .filter(b => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  (b.Room?.name || '').toLowerCase().includes(q) ||
                  (b.User?.name || '').toLowerCase().includes(q) ||
                  (b.User?.email || '').toLowerCase().includes(q)
                );
              })
              .sort((a, b) => {
                // pending first, then by date descending
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (b.status === 'pending' && a.status !== 'pending') return 1;
                return (b.date || '').localeCompare(a.date || '');
              });
            return filtered.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No events match the current filters.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-indigo-700 text-sm">
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-center">Title</th>
                    <th className="py-2 text-center">Room</th>
                    <th className="py-2 text-center">User</th>
                    <th className="py-2 text-center">Date</th>
                    <th className="py-2 text-center">Time</th>
                    <th className="py-2 text-center">Reviewed By</th>
                    <th className="py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} className="border-b last:border-none">
                      <td className="py-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusStyles[b.status] || 'bg-slate-100 text-slate-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 text-center font-semibold">{b.title || '—'}</td>
                      <td className="py-2 text-center font-semibold">{b.Room?.name || b.roomId}</td>
                      <td className="py-2 text-center text-slate-700">{b.User?.name || b.User?.email || b.userId}</td>
                      <td className="py-2 text-center text-slate-500">{b.date}</td>
                      <td className="py-2 text-center text-slate-500">{b.startTime} - {b.endTime}</td>
                      <td className="py-2 text-center text-slate-500 text-xs">
                        {b.Reviewer ? (b.Reviewer.name || b.Reviewer.email) : b.status === 'pending' ? <span className="text-slate-300">—</span> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-2 text-center">
                        {b.status === 'pending' ? (
                          <>
                            <button className="bg-green-100 text-green-700 px-3 py-1 rounded-lg mr-1 text-xs font-semibold" onClick={() => updateStatus(b.id, 'approved')}>Approve</button>
                            <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold" onClick={() => updateStatus(b.id, 'rejected')}>Reject</button>
                          </>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
        )}
      </div>
    );
  }

  // User dashboard
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">My Dashboard</h1>
      <SectionHeader id="myBookings" title="My Booking Requests" count={userBookings.length} />
      {!collapsed.myBookings && (
      <>
      {userBookingsLoading ? (
        <p className="text-slate-500 mb-8">Loading bookings...</p>
      ) : (
      <table className="w-full mb-8 bg-white rounded-2xl shadow p-4">
        <thead>
          <tr className="text-indigo-700">
            <th className="py-2 text-center">Title</th>
            <th className="py-2 text-center">Room</th>
            <th className="py-2 text-center">Date</th>
            <th className="py-2 text-center">Time</th>
            <th className="py-2 text-center">Status</th>
            <th className="py-2 text-center">Reviewed By</th>
          </tr>
        </thead>
        <tbody>
          {userBookings.length === 0 ? (
            <tr><td colSpan="6" className="py-4 text-center text-slate-500">No bookings yet.</td></tr>
          ) : userBookings.map(b => (
            <tr key={b.id} className="border-b last:border-none">
              <td className="py-2 text-center font-semibold">{b.title || '—'}</td>
              <td className="py-2 text-center">{b.Room?.name || b.roomId}</td>
              <td className="py-2 text-center">{b.date}</td>
              <td className="py-2 text-center">{b.startTime} - {b.endTime}</td>
              <td className={`py-2 font-bold text-center ${b.status === 'approved' ? 'text-green-700' : b.status === 'pending' ? 'text-orange-600' : 'text-red-700'}`}>{b.status}</td>
              <td className="py-2 text-center text-slate-500 text-xs">{b.Reviewer ? (b.Reviewer.name || b.Reviewer.email) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
      </>
      )}
    </div>
  );
}
