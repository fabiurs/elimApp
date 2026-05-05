import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMyProfile, updateMyProfile } from '../hooks/useProfile';

const ROLE_OPTIONS = ['audio', 'video', 'lyrics'];
const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function ProfilePage() {
  const { token } = useAuth();
  const { data, loading, error, refetch } = useMyProfile(token);

  const [profileForm, setProfileForm] = useState({
    phone: '',
    bio: '',
    autoAssignable: true,
    preferredRoles: [],
  });
  const [availabilities, setAvailabilities] = useState([]);
  const [blackouts, setBlackouts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!data) return;
    setProfileForm({
      phone: data.profile?.phone || '',
      bio: data.profile?.bio || '',
      autoAssignable: data.profile?.autoAssignable !== false,
      preferredRoles: Array.isArray(data.profile?.preferredRoles) ? data.profile.preferredRoles : [],
    });
    setAvailabilities(Array.isArray(data.availabilities) ? data.availabilities.map((slot) => ({
      dayOfWeek: Number(slot.dayOfWeek),
      startTime: (slot.startTime || '').slice(0, 5),
      endTime: (slot.endTime || '').slice(0, 5),
    })) : []);
    setBlackouts(Array.isArray(data.blackouts) ? data.blackouts.map((entry) => ({
      startDate: entry.startDate || '',
      endDate: entry.endDate || '',
      reason: entry.reason || '',
    })) : []);
  }, [data]);

  function togglePreferredRole(role) {
    setProfileForm((prev) => {
      const hasRole = prev.preferredRoles.includes(role);
      return {
        ...prev,
        preferredRoles: hasRole
          ? prev.preferredRoles.filter((r) => r !== role)
          : [...prev.preferredRoles, role],
      };
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      await updateMyProfile(token, {
        ...profileForm,
        availabilities,
        blackouts,
      });
      setMessage('Profile updated successfully.');
      await refetch();
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-8 text-slate-500">Loading profile...</div>;
  }

  if (error) {
    return <div className="max-w-5xl mx-auto px-6 py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-1">My Profile</h1>
        <p className="text-slate-500 text-sm">Set your media preferences, weekly availability, and blackout dates for auto-assignment.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">Volunteer Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <p className="block text-sm font-semibold text-slate-700 mb-2">Preferred Roles</p>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => {
                  const active = profileForm.preferredRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => togglePreferredRole(role)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={profileForm.autoAssignable}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, autoAssignable: e.target.checked }))}
                />
                Allow admins to auto-assign me to events matching my profile
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-indigo-700">Weekly Availability</h2>
            <button
              type="button"
              onClick={() => setAvailabilities((prev) => [...prev, { dayOfWeek: 0, startTime: '09:00', endTime: '11:00' }])}
              className="text-sm font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
            >
              Add Slot
            </button>
          </div>

          {availabilities.length === 0 ? (
            <p className="text-slate-500 text-sm">No weekly availability slots yet.</p>
          ) : (
            <div className="space-y-3">
              {availabilities.map((slot, idx) => (
                <div key={`${idx}-${slot.dayOfWeek}-${slot.startTime}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 border border-slate-200 rounded-lg p-3">
                  <select
                    value={slot.dayOfWeek}
                    onChange={(e) => {
                      const next = [...availabilities];
                      next[idx].dayOfWeek = Number(e.target.value);
                      setAvailabilities(next);
                    }}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  >
                    {DAY_OPTIONS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => {
                      const next = [...availabilities];
                      next[idx].startTime = e.target.value;
                      setAvailabilities(next);
                    }}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => {
                      const next = [...availabilities];
                      next[idx].endTime = e.target.value;
                      setAvailabilities(next);
                    }}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setAvailabilities((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-indigo-700">Blackout Dates</h2>
            <button
              type="button"
              onClick={() => setBlackouts((prev) => [...prev, { startDate: '', endDate: '', reason: '' }])}
              className="text-sm font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
            >
              Add Range
            </button>
          </div>

          {blackouts.length === 0 ? (
            <p className="text-slate-500 text-sm">No blackout date ranges yet.</p>
          ) : (
            <div className="space-y-3">
              {blackouts.map((entry, idx) => (
                <div key={`${idx}-${entry.startDate}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 border border-slate-200 rounded-lg p-3">
                  <input
                    type="date"
                    value={entry.startDate}
                    onChange={(e) => {
                      const next = [...blackouts];
                      next[idx].startDate = e.target.value;
                      setBlackouts(next);
                    }}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <input
                    type="date"
                    value={entry.endDate}
                    onChange={(e) => {
                      const next = [...blackouts];
                      next[idx].endDate = e.target.value;
                      setBlackouts(next);
                    }}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <input
                    value={entry.reason}
                    onChange={(e) => {
                      const next = [...blackouts];
                      next[idx].reason = e.target.value;
                      setBlackouts(next);
                    }}
                    placeholder="Reason (optional)"
                    className="md:col-span-2 border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setBlackouts((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex items-center justify-between">
          {message ? <p className="text-sm font-semibold text-slate-600">{message}</p> : <span />}
          <button
            type="submit"
            disabled={saving}
            className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
