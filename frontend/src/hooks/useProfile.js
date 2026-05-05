import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';

export function useMyProfile(token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!token) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/profile/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || payload.error || 'Failed to load profile');
      }
      setData(payload);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export async function updateMyProfile(token, payload) {
  const res = await fetch(apiUrl('/api/profile/me'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update profile');
  }
  return data;
}
