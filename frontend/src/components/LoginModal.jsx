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
          <motion.div initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-100">
            {/* Tab switcher */}
            <div className="flex mb-6 rounded-xl overflow-hidden border border-slate-200">
              <button onClick={() => switchTab('login')} className={`flex-1 py-2 font-bold transition-all ${tab === 'login' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}>Sign In</button>
              <button onClick={() => switchTab('register')} className={`flex-1 py-2 font-bold transition-all ${tab === 'register' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}>Register</button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
                {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow transition-all mt-2" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} className="border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
                {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow transition-all mt-2" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
              </form>
            )}
            <button className="mt-6 text-indigo-600 hover:underline w-full text-center font-medium" onClick={() => { resetForm(); onClose(); }}>Cancel</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
