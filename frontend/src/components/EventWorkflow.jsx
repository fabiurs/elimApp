import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { createEvent, updateEvent, deleteEvent, suggestAutoAssignments, useAssignableUsers, useEvents, useMyAssignments } from '../hooks/useEvents';
import { useRooms } from '../hooks/useRooms';

const EVENT_TYPES = ['service', 'prayer', 'youth', 'wedding', 'funeral', 'conference', 'other'];
const MEDIA_ROLES = ['audio', 'video', 'lyrics'];

function AssignmentSelect({ role, users, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{role}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(role, e.target.value ? Number(e.target.value) : null)}
        className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
      >
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
        ))}
      </select>
    </div>
  );
}

export default function EventWorkflow() {
  const { token, isAdmin } = useAuth();
  const { events, loading, error, refetch } = useEvents(token);
  const { assignments: myAssignments, loading: assignmentsLoading } = useMyAssignments(token);
  const { users } = useAssignableUsers(token, isAdmin);
  const { rooms } = useRooms(token);

  const [form, setForm] = useState({
    title: '',
    description: '',
    eventType: 'service',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    roomId: '',
    syncToGoogle: true,
  });
  const [mediaAssignments, setMediaAssignments] = useState({ audio: null, video: null, lyrics: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    eventType: 'service',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    roomId: '',
    syncToGoogle: true,
  });
  const [editAssignments, setEditAssignments] = useState({ audio: null, video: null, lyrics: null });
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [suggestingCreate, setSuggestingCreate] = useState(false);
  const [suggestingEdit, setSuggestingEdit] = useState(false);

  const groupedByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, [events]);

  async function handleCreateEvent(e) {
    e.preventDefault();
    setSubmitMessage('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        roomId: form.roomId ? Number(form.roomId) : null,
        assignments: mediaAssignments,
      };
      const result = await createEvent(token, payload);
      const syncMessage = result.googleSync?.synced
        ? 'Google Calendar synced successfully.'
        : `Google Calendar not synced: ${result.googleSync?.reason || 'not configured'}.`;
      setSubmitMessage(`Event created. ${syncMessage}`);
      setForm({
        title: '',
        description: '',
        eventType: 'service',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        roomId: '',
        syncToGoogle: true,
      });
      setMediaAssignments({ audio: null, video: null, lyrics: null });
      await refetch();
    } catch (err) {
      setSubmitMessage(err.message);
    }
    setSubmitting(false);
  }

  async function handleSuggestForCreate() {
    if (!form.date || !form.startTime || !form.endTime) {
      setSubmitMessage('Pick date, start time and end time before using auto-assign.');
      return;
    }
    setSubmitMessage('');
    setSuggestingCreate(true);
    try {
      const result = await suggestAutoAssignments(token, {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        assignments: mediaAssignments,
      });
      setMediaAssignments(result.suggestions || { audio: null, video: null, lyrics: null });
      setSubmitMessage('Auto-assignment suggestions applied.');
    } catch (err) {
      setSubmitMessage(err.message);
    }
    setSuggestingCreate(false);
  }

  function startEdit(event) {
    setEditingEventId(event.id);
    setEditForm({
      title: event.title || '',
      description: event.description || '',
      eventType: event.eventType || 'service',
      date: event.date || '',
      startTime: event.startTime ? event.startTime.slice(0, 5) : '',
      endTime: event.endTime ? event.endTime.slice(0, 5) : '',
      location: event.location || '',
      roomId: event.roomId ? String(event.roomId) : '',
      syncToGoogle: true,
    });
    setEditAssignments({
      audio: event.assignments?.audio?.id || null,
      video: event.assignments?.video?.id || null,
      lyrics: event.assignments?.lyrics?.id || null,
    });
  }

  function cancelEdit() {
    setEditingEventId(null);
    setEditAssignments({ audio: null, video: null, lyrics: null });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingEventId) return;
    setSubmitMessage('');
    setSubmitting(true);
    try {
      const payload = {
        ...editForm,
        roomId: editForm.roomId ? Number(editForm.roomId) : null,
        assignments: editAssignments,
      };
      const result = await updateEvent(token, editingEventId, payload);
      const syncMessage = result.googleSync?.synced
        ? 'Google Calendar synced successfully.'
        : `Google Calendar not synced: ${result.googleSync?.reason || 'not configured'}.`;
      setSubmitMessage(`Event updated. ${syncMessage}`);
      cancelEdit();
      await refetch();
    } catch (err) {
      setSubmitMessage(err.message);
    }
    setSubmitting(false);
  }

  async function handleSuggestForEdit() {
    if (!editingEventId) return;
    if (!editForm.date || !editForm.startTime || !editForm.endTime) {
      setSubmitMessage('Pick date, start time and end time before using auto-assign.');
      return;
    }
    setSubmitMessage('');
    setSuggestingEdit(true);
    try {
      const result = await suggestAutoAssignments(token, {
        eventId: editingEventId,
        date: editForm.date,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        assignments: editAssignments,
      });
      setEditAssignments(result.suggestions || { audio: null, video: null, lyrics: null });
      setSubmitMessage('Auto-assignment suggestions applied.');
    } catch (err) {
      setSubmitMessage(err.message);
    }
    setSuggestingEdit(false);
  }

  async function handleDeleteEvent(eventId) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setSubmitMessage('');
    setDeletingEventId(eventId);
    try {
      await deleteEvent(token, eventId);
      if (editingEventId === eventId) cancelEdit();
      setSubmitMessage('Event deleted successfully.');
      await refetch();
    } catch (err) {
      setSubmitMessage(err.message);
    }
    setDeletingEventId(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-1">Church Event Workflow</h1>
        <p className="text-slate-500 text-sm">Plan events, assign media teams, and link with Google Calendar.</p>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-xl shadow-card p-6 mb-8">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">Create Event</h2>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Event Type</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Room (optional)</label>
              <select
                value={form.roomId}
                onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                <option value="">No linked room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Location (optional)</label>
              <input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description (optional)</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-indigo-700 mb-2">Media Team Assignments</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MEDIA_ROLES.map((role) => (
                  <AssignmentSelect
                    key={role}
                    role={role}
                    users={users}
                    value={mediaAssignments[role]}
                    onChange={(selectedRole, userId) => setMediaAssignments((prev) => ({ ...prev, [selectedRole]: userId }))}
                  />
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex items-center justify-between gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.syncToGoogle}
                  onChange={(e) => setForm((prev) => ({ ...prev, syncToGoogle: e.target.checked }))}
                />
                Sync to Google Calendar (if configured)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSuggestForCreate}
                  disabled={suggestingCreate || submitting}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {suggestingCreate ? 'Suggesting...' : 'Suggest Assignments'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-accent-400 hover:bg-accent-500 text-indigo-900 font-bold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
          {submitMessage && (
            <p className="mt-3 text-sm font-semibold text-slate-600">{submitMessage}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">Upcoming Events</h2>
          {loading ? (
            <p className="text-slate-500">Loading events...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : Object.keys(groupedByDate).length === 0 ? (
            <p className="text-slate-500">No events yet.</p>
          ) : (
            <div className="space-y-5">
              {Object.keys(groupedByDate).map((dateKey) => (
                <div key={dateKey}>
                  <h3 className="font-bold text-slate-800 mb-2">{dateKey}</h3>
                  <div className="space-y-2">
                    {groupedByDate[dateKey].map((event) => (
                      <div key={event.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-bold text-indigo-700">{event.title}</p>
                            <p className="text-xs text-slate-500">
                              {event.startTime?.slice(0, 5)} - {event.endTime?.slice(0, 5)}
                              {event.Room?.name ? ` | ${event.Room.name}` : ''}
                              {event.location ? ` | ${event.location}` : ''}
                            </p>
                          </div>
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold capitalize">
                            {event.eventType}
                          </span>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2 mb-2">
                            <button
                              type="button"
                              onClick={() => startEdit(event)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={deletingEventId === event.id}
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              {deletingEventId === event.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                        {isAdmin && editingEventId === event.id && (
                          <form onSubmit={handleSaveEdit} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                              <input
                                value={editForm.title}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                required
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                              <select
                                value={editForm.eventType}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, eventType: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              >
                                {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Room</label>
                              <select
                                value={editForm.roomId}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, roomId: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              >
                                <option value="">No linked room</option>
                                {rooms.map((room) => (
                                  <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                                required
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={editForm.startTime}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, startTime: e.target.value }))}
                                required
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                              <input
                                type="time"
                                value={editForm.endTime}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, endTime: e.target.value }))}
                                required
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                              <input
                                value={editForm.location}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                              <textarea
                                rows={2}
                                value={editForm.description}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                              {MEDIA_ROLES.map((role) => (
                                <AssignmentSelect
                                  key={role}
                                  role={role}
                                  users={users}
                                  value={editAssignments[role]}
                                  onChange={(selectedRole, userId) => setEditAssignments((prev) => ({ ...prev, [selectedRole]: userId }))}
                                />
                              ))}
                            </div>
                            <div className="md:col-span-2 flex items-center justify-between gap-3">
                              <label className="flex items-center gap-2 text-xs text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={editForm.syncToGoogle}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, syncToGoogle: e.target.checked }))}
                                />
                                Sync updates to Google Calendar
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleSuggestForEdit}
                                  disabled={suggestingEdit || submitting}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                                >
                                  {suggestingEdit ? 'Suggesting...' : 'Suggest Assignments'}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={submitting}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                  {submitting ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                        {event.description && (
                          <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                        )}
                        <div className="text-xs text-slate-600 grid grid-cols-1 md:grid-cols-3 gap-1">
                          {MEDIA_ROLES.map((role) => (
                            <p key={role}><span className="font-semibold uppercase">{role}:</span> {event.assignments?.[role]?.name || 'Unassigned'}</p>
                          ))}
                        </div>
                        {event.googleCalendarUrl && (
                          <a
                            href={event.googleCalendarUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Add to Google Calendar
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">My Media Assignments</h2>
          {assignmentsLoading ? (
            <p className="text-slate-500">Loading assignments...</p>
          ) : myAssignments.length === 0 ? (
            <p className="text-slate-500">No assignments yet.</p>
          ) : (
            <div className="space-y-3">
              {myAssignments.map((a) => (
                <div key={a.id} className="border border-slate-200 rounded-lg p-3">
                  <p className="text-xs uppercase font-bold text-indigo-600 mb-1">{a.role}</p>
                  <p className="font-semibold text-slate-800">{a.event.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.event.date} | {a.event.startTime?.slice(0, 5)} - {a.event.endTime?.slice(0, 5)}
                  </p>
                  {a.event.googleCalendarUrl && (
                    <a
                      href={a.event.googleCalendarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Open in Google Calendar
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
