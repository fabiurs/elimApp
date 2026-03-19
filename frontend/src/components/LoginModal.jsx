import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginModal({ open, onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      setLoading(false);
      if (!res.token) setError(res.message || res.error || 'Login failed');
      else { resetForm(); onClose(); }
    } catch {
      setLoading(false);
      setError('Server unreachable');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await register(name, email, password);
      setLoading(false);
      if (!res.token) setError(res.message || res.error || 'Registration failed');
      else { resetForm(); onClose(); }
    } catch {
      setLoading(false);
      setError('Server unreachable');
    }
  }

  function resetForm() {
    setName(''); setEmail(''); setPassword(''); setError('');
  }

  function switchTab(t) {
    setTab(t); resetForm();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-white rounded-xl shadow-card-lg p-8 w-full max-w-md border border-slate-100">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-2xl font-extrabold text-indigo-600 tracking-tight">CBS</div>
              <div className="text-slate-500 text-sm mt-0.5">Church Room Booking System</div>
            </div>
            {/* Tab switcher */}
            <div className="flex mb-6 rounded-lg overflow-hidden border border-slate-200">
              <button onClick={() => switchTab('login')} className={`flex-1 py-2 text-sm font-bold transition-all duration-200 ${tab === 'login' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-slate-50'}`}>Sign In</button>
              <button onClick={() => switchTab('register')} className={`flex-1 py-2 text-sm font-bold transition-all duration-200 ${tab === 'register' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-slate-50'}`}>Register</button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-accent-200 outline-none transition" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-accent-200 outline-none transition" />
                {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
                <button type="submit" className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-6 py-3 rounded-lg shadow transition-all duration-200 mt-2" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-accent-200 outline-none transition" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-accent-200 outline-none transition" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} className="border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-accent-200 outline-none transition" />
                {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
                <button type="submit" className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-6 py-3 rounded-lg shadow transition-all duration-200 mt-2" disabled={loading}>{loading ? 'Creating account…' : 'Register'}</button>
              </form>
            )}
            <button className="mt-5 text-slate-500 hover:text-indigo-600 w-full text-center text-sm font-medium transition-colors duration-200" onClick={() => { resetForm(); onClose(); }}>Cancel</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
