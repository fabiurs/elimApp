import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';

export function useEvents(token) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!token) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/events'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to load events');
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

export function useMyAssignments(token) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    if (!token) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/events/my-assignments'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      setAssignments([]);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, loading, refetch: fetchAssignments };
}

export function useAssignableUsers(token, enabled) {
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    if (!token || !enabled) {
      setUsers([]);
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/events/assignable-users'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  }, [token, enabled]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, refetch: fetchUsers };
}

export async function createEvent(token, payload) {
  const res = await fetch(apiUrl('/api/events'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create event');
  }
  return data;
}

export async function updateEvent(token, eventId, payload) {
  const res = await fetch(apiUrl(`/api/events/${eventId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update event');
  }
  return data;
}

export async function deleteEvent(token, eventId) {
  const res = await fetch(apiUrl(`/api/events/${eventId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete event');
  }
  return data;
}

export async function suggestAutoAssignments(token, payload) {
  const res = await fetch(apiUrl('/api/events/auto-assign'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to generate auto-assignment suggestions');
  }
  return data;
}
