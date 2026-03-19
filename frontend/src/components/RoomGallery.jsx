import React from 'react';
import RoomCard from './RoomCard';
import { useRooms } from '../hooks/useRooms';

export default function RoomGallery({ token, onSelect }) {
  const { rooms, loading } = useRooms(token);

  return (
    <div>
      {/* Hero banner */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-8 py-14">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold mb-3 leading-tight">Find the Right Room</h1>
            <p className="text-white/65 text-base leading-relaxed">
              Browse available spaces and make a booking request for your next event, meeting, or community activity.
            </p>
          </div>
        </div>
      </div>

      {/* Room grid */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        {loading ? (
          <p className="text-center text-slate-500 py-16">Loading rooms…</p>
        ) : !rooms.length ? (
          <p className="text-center text-slate-500 py-16">No rooms available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {rooms.map(room => (
              <RoomCard key={room._id || room.id} room={room} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
