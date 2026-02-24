import React from 'react';
import RoomCard from './RoomCard';

// Dummy data for development/demo
const dummyRooms = [
  {
    _id: '1',
    name: 'Main Sanctuary',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    capacity: 200,
    amenities: ['Projector', 'Sound System', 'WiFi'],
  },
  {
    _id: '2',
    name: 'Youth Hall',
    image_url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    capacity: 80,
    amenities: ['Whiteboard', 'WiFi'],
  },
  {
    _id: '3',
    name: 'Prayer Room',
    image_url: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
    capacity: 20,
    amenities: ['Quiet Zone'],
  },
  {
    _id: '4',
    name: 'Fellowship Hall',
    image_url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    capacity: 100,
    amenities: ['Kitchen', 'Tables', 'WiFi'],
  },
  {
    _id: '5',
    name: 'Kids Room',
    image_url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
    capacity: 30,
    amenities: ['Toys', 'TV'],
  },
  {
    _id: '6',
    name: 'Conference Room',
    image_url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    capacity: 40,
    amenities: ['Projector', 'Whiteboard', 'WiFi'],
  },
];

export default function RoomGallery({ token, onSelect }) {
  // Use dummyRooms for frontend demo
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-10">
      {dummyRooms.map(room => (
        <RoomCard key={room._id} room={room} onSelect={onSelect} />
      ))}
    </div>
  );
}
