const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, image_url, capacity, amenities } = req.body;
    if (!name || !capacity) return res.status(400).json({ message: 'Name and capacity are required' });
    const room = await Room.create({ name, image_url, capacity, amenities: amenities || [] });
    res.status(201).json(room);
  } catch (err) {
    console.error('createRoom error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    await room.destroy();
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
