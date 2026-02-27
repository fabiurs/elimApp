import React from 'react';

export default function RoomCard({ room, onSelect }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 flex flex-col items-center transition-transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-accent-400 group">
      <img src={room.image_url} alt={room.name} className="w-full h-40 object-cover rounded-xl mb-4 shadow-sm" />
      <h2 className="text-xl font-extrabold mb-2 text-indigo-900 tracking-tight text-center">{room.name}</h2>
      <p className="text-slate-500 mb-1 text-sm">Capacity: <span className="font-semibold text-slate-700">{room.capacity}</span></p>
      <div className="flex flex-wrap gap-2 mb-2 justify-center">
        {room.amenities.map((a, i) => (
          <span key={i} className="bg-accent-50 text-accent-700 px-2 py-1 rounded-lg text-xs font-medium shadow-sm">{a}</span>
        ))}
      </div>
      <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl shadow transition-all mt-2 w-full" onClick={() => onSelect(room)}>
        Select
      </button>
    </div>
  );
}
