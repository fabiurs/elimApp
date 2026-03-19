import React from 'react';

export default function RoomCard({ room, onSelect }) {
  return (
    <div className="bg-white rounded-xl shadow-card hover:shadow-card-lg p-6 flex flex-col items-center transition-all duration-250 hover:-translate-y-1 cursor-pointer border border-transparent hover:border-accent-200 group">
      <div className="w-full h-44 overflow-hidden rounded-lg mb-4 shadow-sm">
        <img src={room.image_url} alt={room.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <h2 className="text-lg font-extrabold mb-1 text-indigo-600 tracking-tight text-center">{room.name}</h2>
      <p className="text-slate-500 mb-2 text-sm">Capacity: <span className="font-semibold text-slate-700">{room.capacity}</span></p>
      <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
        {room.amenities.map((a, i) => (
          <span key={i} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">{a}</span>
        ))}
      </div>
      <button
        className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-6 py-2.5 rounded-lg shadow transition-all duration-200 mt-auto w-full text-sm"
        onClick={() => onSelect(room)}
      >
        Book Room
      </button>
    </div>
  );
}
