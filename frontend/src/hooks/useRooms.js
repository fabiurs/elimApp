import { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../utils/api';

export function useRooms(token) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const res = await fetch(apiUrl('/api/rooms'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRooms(data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (token) fetchRooms();
  }, [token, fetchRooms]);

  async function updateRoom(id, updates) {
    const res = await fetch(apiUrl(`/api/rooms/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || data.error || 'Failed to update room');
    }
    await fetchRooms();
    return res.json();
  }

  async function deleteRoom(id) {
    const res = await fetch(apiUrl(`/api/rooms/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || data.error || 'Failed to delete room');
    }
    await fetchRooms();
  }

  return { rooms, loading, fetchRooms, updateRoom, deleteRoom };
}
