import React from 'react';

export default function BookingSummary({ room, date, start, end, onConfirm }) {
  return (
    <aside className="fixed bottom-0 left-0 w-full bg-white shadow-2xl rounded-t-2xl p-6 flex flex-col md:flex-row items-center justify-between z-40 border-t border-slate-200 gap-4 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
        <span className="font-extrabold text-indigo-700 text-lg">{room.name}</span>
        <span className="text-slate-500 font-medium">{date}</span>
        <span className="text-indigo-900 font-semibold">{start} - {end}</span>
      </div>
      <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow transition-all text-lg" onClick={onConfirm}>Confirm</button>
    </aside>
  );
}
