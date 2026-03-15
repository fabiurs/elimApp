import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl } from '../utils/api';

export default function AddRoomModal({ open, onClose, onRoomAdded }) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [capacity, setCapacity] = useState('');
  const [amenities, setAmenities] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/rooms'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          image_url,
          capacity: Number(capacity),
          amenities: amenities.split(',').map(a => a.trim()).filter(Boolean),
        })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) setError(data.message || data.error || 'Failed to add room');
      else {
        onRoomAdded && onRoomAdded(data);
        setName(''); setImageUrl(''); setCapacity(''); setAmenities('');
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setError('Server error');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-slate-100">
            <h2 className="text-2xl font-extrabold mb-6 text-indigo-900 text-center tracking-tight">Add New Room</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="text" placeholder="Room Name" value={name} onChange={e => setName(e.target.value)} required className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
              <input type="url" placeholder="Image URL" value={image_url} onChange={e => setImageUrl(e.target.value)} required className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
              <input type="number" placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)} min="1" required className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
              <input type="text" placeholder="Amenities (comma separated)" value={amenities} onChange={e => setAmenities(e.target.value)} className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
              {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow transition-all mt-2" disabled={loading}>{loading ? 'Adding...' : 'Add Room'}</button>
            </form>
            <button className="mt-6 text-indigo-600 hover:underline w-full text-center font-medium" onClick={onClose}>Cancel</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
