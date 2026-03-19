import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as dateFns from 'date-fns';

export default function TimePicker({ bookedSlots, onSelect, onDateChange }) {
  const navigate = useNavigate();
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
    };
  });

  const slots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const min = i % 2 === 0 ? '00' : '30';
    return {
      key: `${hour.toString().padStart(2, '0')}:${min}`,
      time: `${hour.toString().padStart(2, '0')}:${min}`,
    };
  });

  const [dateIdx, setDateIdx] = useState(0);
  const [selecting, setSelecting] = useState(null);
  const [startIdx, setStartIdx] = useState(null);
  const [endIdx, setEndIdx] = useState(null);

  function handleSlotClick(idx) {
    if (startIdx === null || (startIdx !== null && endIdx !== null)) {
      setStartIdx(idx);
      setEndIdx(null);
      setSelecting(null);
    } else if (startIdx !== null && endIdx === null) {
      if (idx < startIdx) {
        setStartIdx(idx);
        setEndIdx(startIdx);
      } else {
        setEndIdx(idx);
      }
      const duration = Math.abs(idx - startIdx) * 30 + 30;
      setSelecting({ start: Math.min(startIdx, idx), end: Math.max(startIdx, idx), duration: `${Math.floor(duration / 60)}h ${duration % 60}m` });
    }
  }

  function handleDateSelect(i) {
    setDateIdx(i);
    setStartIdx(null);
    setEndIdx(null);
    setSelecting(null);
    onDateChange && onDateChange(dates[i].key);
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {dates.map((d, i) => (
          <button
            key={d.key}
            onClick={() => handleDateSelect(i)}
            className={`min-w-[70px] px-3 py-2 rounded-xl font-semibold flex flex-col items-center transition-all shadow-sm border-2 ${dateIdx === i ? 'bg-accent-500 text-white shadow-lg border-accent-500' : 'bg-white text-indigo-700 hover:bg-accent-50 border-slate-200'}`}
          >
            <span className="text-xs font-medium">{d.day}</span>
            <span className="text-lg">{d.date}</span>
          </button>
        ))}
      </div>
      <div className="relative h-[480px] overflow-y-auto border rounded-2xl bg-white shadow-inner p-2">
        {slots.map((slot, i) => {
          const isBooked = bookedSlots.includes(slot.key);
          const isSelected = selecting && i >= selecting.start && i <= selecting.end;
          return (
            <motion.button
              key={slot.key}
              layout
              disabled={isBooked}
              onClick={() => handleSlotClick(i)}
              className={`w-full flex items-center justify-between px-4 py-2 my-1 rounded-lg transition-all font-medium
                ${isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                  isSelected ? 'bg-accent-500 text-white font-bold shadow-lg' :
                  'hover:bg-accent-50 text-indigo-900'}
              `}
              whileHover={!isBooked && !isSelected ? { scale: 1.02 } : {}}
            >
              <span>{slot.time}</span>
              {isSelected && selecting.start === i && (
                <motion.span layoutId="duration" className="ml-auto text-xs bg-accent-600 text-white px-2 py-0.5 rounded-full">
                  {selecting.duration}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
      {selecting && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-2xl rounded-t-2xl p-4 flex items-center justify-between z-30 border-t border-slate-200">
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
            <span className="font-bold text-accent-600">Selected</span>
            <span className="text-gray-500">{dates[dateIdx].day} {dates[dateIdx].date}</span>
            <span className="text-indigo-900 font-semibold">{slots[selecting.start].time} - {slots[selecting.end].time}</span>
            <span className="text-accent-600">{selecting.duration}</span>
          </div>
          <button className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-6 py-2 rounded-lg shadow transition-all duration-200" onClick={() => { onSelect({ date: dates[dateIdx].key, start: slots[selecting.start].key, end: slots[selecting.end].key }); navigate('/summary'); }}>Continue</button>
        </div>
      )}
    </div>
  );
}
