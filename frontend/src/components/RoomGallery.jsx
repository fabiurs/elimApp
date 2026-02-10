import React from 'react';
import RoomCard from './RoomCard';
import { useRooms } from '../hooks/useRooms';
import { useSkeleton } from '../hooks/useSkeleton';

export default function RoomGallery({ token, onSelect }) {
  const { rooms, loading } = useRooms(token);
  const skeletons = useSkeleton(6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-10">
      {loading
        ? skeletons.map(i => (
            <div key={i} className="bg-slate-100 animate-pulse h-64 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]" />
          ))
        : rooms.map(room => (
            <RoomCard key={room._id} room={room} onSelect={onSelect} />
          ))}
    </div>
  );
}
