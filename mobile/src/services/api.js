import API_BASE from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getToken() {
  return await AsyncStorage.getItem('jwt');
}

async function authHeaders() {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------- Auth ----------

export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function apiRegister(name, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function apiGetMe() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/auth/me`, { headers });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

// ---------- Rooms ----------

export async function apiGetRooms() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/rooms`, { headers });
  return res.json();
}

export async function apiCreateRoom(room) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers,
    body: JSON.stringify(room),
  });
  return res.json();
}

export async function apiUpdateRoom(id, updates) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/rooms/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function apiDeleteRoom(id) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/rooms/${id}`, {
    method: 'DELETE',
    headers,
  });
  return res.json();
}

// ---------- Bookings ----------

export async function apiGetUserBookings() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/bookings`, { headers });
  return res.json();
}

export async function apiGetApprovedBookings() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/bookings/calendar`, { headers });
  return res.json();
}

export async function apiCreateBooking(booking) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(booking),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Booking failed');
  return data;
}

// ---------- Admin ----------

export async function apiGetAllBookings() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/admin/bookings`, { headers });
  return res.json();
}

export async function apiUpdateBookingStatus(id, status) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  return res.json();
}
