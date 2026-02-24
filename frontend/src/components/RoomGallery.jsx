import React from 'react';
import RoomCard from './RoomCard';
import { useRooms } from '../hooks/useRooms';

export default function RoomGallery({ token, onSelect }) {
  const { rooms, loading } = useRooms(token);

  if (loading) {
    return <p className="text-center text-slate-500 mt-10">Loading rooms...</p>;
  }

  if (!rooms.length) {
    return <p className="text-center text-slate-500 mt-10">No rooms available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-10">
      {rooms.map(room => (
        <RoomCard key={room._id} room={room} onSelect={onSelect} />
      ))}
    </div>
  );
}
