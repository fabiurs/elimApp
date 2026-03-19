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
          className={`w-4 h-4 text-accent-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <h2 className="text-lg font-bold text-indigo-600">{title}</h2>
        {count !== undefined && (
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </button>
    );
  }

  // Admin dashboard
  if (isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-600 mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage rooms and review booking requests.</p>
        </div>
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-6 py-2.5 rounded-lg shadow transition-all duration-200 text-sm"
            onClick={() => setShowAddRoom(true)}
          >
            + Add Room
          </button>
        </div>
        <AddRoomModal open={showAddRoom} onClose={() => setShowAddRoom(false)} />
        <EditRoomModal open={!!editingRoom} onClose={() => setEditingRoom(null)} room={editingRoom} onSave={updateRoom} />
        <SectionHeader id="rooms" title="Rooms" count={rooms.length} />
        {!collapsed.rooms && (
        <>
        {roomsLoading ? (
          <p className="text-slate-500 mb-8">Loading rooms...</p>
        ) : (
        <div className="overflow-x-auto">
        <table className="w-full mb-8 bg-white rounded-xl shadow-card overflow-hidden">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-indigo-600 text-sm">
              <th className="py-3 px-4 text-left font-semibold">Name</th>
              <th className="py-3 px-4 text-center font-semibold">Capacity</th>
              <th className="py-3 px-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id || room.id} className="border-b last:border-none hover:bg-slate-50 transition-colors duration-150">
                <td className="py-3 px-4 font-semibold text-slate-800">{room.name}</td>
                <td className="py-3 px-4 text-center text-slate-600">{room.capacity}</td>
                <td className="py-3 px-4 text-center">
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg mr-2 text-xs font-semibold transition-colors duration-150" onClick={() => setEditingRoom(room)}>Edit</button>
                  <button className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150" onClick={() => handleDelete(room)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
        </>
        )}
        <SectionHeader id="pending" title="Pending Booking Requests" count={adminBookings.filter(b => b.status === 'pending').length} />
        {!collapsed.pending && (
        <>
        {adminBookingsLoading ? (
          <p className="text-slate-500 mb-8">Loading bookings...</p>
        ) : (
        <div className="overflow-x-auto">
        <table className="w-full mb-8 bg-white rounded-xl shadow-card overflow-hidden">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-indigo-600 text-sm">
              <th className="py-3 px-4 text-left font-semibold">Title</th>
              <th className="py-3 px-4 text-left font-semibold">Room</th>
              <th className="py-3 px-4 text-left font-semibold">User</th>
              <th className="py-3 px-4 text-center font-semibold">Date</th>
              <th className="py-3 px-4 text-center font-semibold">Time</th>
              <th className="py-3 px-4 text-center font-semibold">Status</th>
              <th className="py-3 px-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminBookings.filter(b => b.status === 'pending').map(b => (
              <tr key={b.id} className="border-b last:border-none hover:bg-slate-50 transition-colors duration-150">
                <td className="py-3 px-4 font-semibold text-slate-800">{b.title || '—'}</td>
                <td className="py-3 px-4 text-slate-600">{b.Room?.name || b.roomId}</td>
                <td className="py-3 px-4 text-slate-600">{b.User?.name || b.User?.email || b.userId}</td>
                <td className="py-3 px-4 text-center text-slate-500 text-sm">{b.date}</td>
                <td className="py-3 px-4 text-center text-slate-500 text-sm">{b.startTime} - {b.endTime}</td>
                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">{b.status}</span></td>
                <td className="py-3 px-4 text-center">
                  <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg mr-1.5 text-xs font-semibold transition-colors duration-150" onClick={() => updateStatus(b.id, 'approved')}>Approve</button>
                  <button className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150" onClick={() => updateStatus(b.id, 'rejected')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
        </>
        )}
        <SectionHeader id="events" title="All Events" count={adminBookings.length} />
        {!collapsed.events && (
        <div className="bg-white rounded-xl shadow-card p-6 mb-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5 items-center">
            {/* Status filter tabs */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-slate-50'}`}
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
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-accent-200 outline-none"
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
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-accent-200 outline-none flex-1 min-w-[180px]"
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
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-indigo-600 text-xs">
                    <th className="py-3 px-3 text-center font-semibold">Status</th>
                    <th className="py-3 px-3 text-left font-semibold">Title</th>
                    <th className="py-3 px-3 text-left font-semibold">Room</th>
                    <th className="py-3 px-3 text-left font-semibold">User</th>
                    <th className="py-3 px-3 text-center font-semibold">Date</th>
                    <th className="py-3 px-3 text-center font-semibold">Time</th>
                    <th className="py-3 px-3 text-center font-semibold">Reviewed By</th>
                    <th className="py-3 px-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} className="border-b last:border-none hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusStyles[b.status] || 'bg-slate-100 text-slate-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 text-sm">{b.title || '—'}</td>
                      <td className="py-3 px-3 text-slate-600 text-sm">{b.Room?.name || b.roomId}</td>
                      <td className="py-3 px-3 text-slate-600 text-sm">{b.User?.name || b.User?.email || b.userId}</td>
                      <td className="py-3 px-3 text-center text-slate-500 text-sm">{b.date}</td>
                      <td className="py-3 px-3 text-center text-slate-500 text-sm">{b.startTime} - {b.endTime}</td>
                      <td className="py-3 px-3 text-center text-slate-400 text-xs">
                        {b.Reviewer ? (b.Reviewer.name || b.Reviewer.email) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {b.status === 'pending' ? (
                          <>
                            <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg mr-1 text-xs font-semibold transition-colors duration-150" onClick={() => updateStatus(b.id, 'approved')}>Approve</button>
                            <button className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150" onClick={() => updateStatus(b.id, 'rejected')}>Reject</button>
                          </>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            );
          })()}
        </div>
        )}
      </div>
    );
  }

  // User dashboard
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-1">My Dashboard</h1>
        <p className="text-slate-500 text-sm">Track the status of your booking requests.</p>
      </div>
      <SectionHeader id="myBookings" title="My Booking Requests" count={userBookings.length} />
      {!collapsed.myBookings && (
      <>
      {userBookingsLoading ? (
        <p className="text-slate-500 mb-8">Loading bookings...</p>
      ) : (
      <div className="overflow-x-auto">
      <table className="w-full mb-8 bg-white rounded-xl shadow-card overflow-hidden">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-indigo-600 text-sm">
            <th className="py-3 px-4 text-left font-semibold">Title</th>
            <th className="py-3 px-4 text-left font-semibold">Room</th>
            <th className="py-3 px-4 text-center font-semibold">Date</th>
            <th className="py-3 px-4 text-center font-semibold">Time</th>
            <th className="py-3 px-4 text-center font-semibold">Status</th>
            <th className="py-3 px-4 text-center font-semibold">Reviewed By</th>
          </tr>
        </thead>
        <tbody>
          {userBookings.length === 0 ? (
            <tr><td colSpan="6" className="py-8 text-center text-slate-400">No bookings yet.</td></tr>
          ) : userBookings.map(b => (
            <tr key={b.id} className="border-b last:border-none hover:bg-slate-50 transition-colors duration-150">
              <td className="py-3 px-4 font-semibold text-slate-800">{b.title || '—'}</td>
              <td className="py-3 px-4 text-slate-600">{b.Room?.name || b.roomId}</td>
              <td className="py-3 px-4 text-center text-slate-500 text-sm">{b.date}</td>
              <td className="py-3 px-4 text-center text-slate-500 text-sm">{b.startTime} - {b.endTime}</td>
              <td className="py-3 px-4 text-center">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusStyles[b.status] || 'bg-slate-100 text-slate-600'}`}>{b.status}</span>
              </td>
              <td className="py-3 px-4 text-center text-slate-400 text-xs">{b.Reviewer ? (b.Reviewer.name || b.Reviewer.email) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      )}
      </>
      )}
    </div>
  );
}
