import { useState } from 'react';

export function useBookings(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBooking = async (booking) => {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/bookings', {
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
    return data;
  };

  return { createBooking, loading, error };
}
