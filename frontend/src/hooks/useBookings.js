import { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';

export function useBookings(token) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/bookings'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const createBooking = async (booking) => {
    setLoading(true);
    setError(null);
    const res = await fetch(apiUrl('/api/bookings'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(booking),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.message || 'Booking failed');
    else await fetchBookings(); // refresh list
    return data;
  };

  return { bookings, createBooking, loading, error, refetch: fetchBookings };
}

export function useAdminBookings(token) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/bookings'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const updateStatus = async (id, status) => {
    const res = await fetch(apiUrl(`/api/admin/bookings/${id}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await fetchBookings();
    return res.ok;
  };

  return { bookings, loading, updateStatus, refetch: fetchBookings };
}
