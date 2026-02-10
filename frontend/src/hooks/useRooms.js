import { useState, useEffect } from 'react';

export function useRooms(token) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      const res = await fetch('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRooms(data);
      setLoading(false);
    }
    if (token) fetchRooms();
  }, [token]);

  return { rooms, loading };
}
