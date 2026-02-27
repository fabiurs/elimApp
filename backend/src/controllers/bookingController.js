const Booking = require('../models/Booking');
const User = require('../models/User');
const Room = require('../models/Room');
const { Op } = require('sequelize');

// Overlap check helper
async function isOverlap(roomId, date, startTime, endTime) {
  const overlap = await Booking.findOne({
    where: {
      roomId,
      date,
      status: 'approved',
      startTime: { [Op.lt]: endTime },
      endTime: { [Op.gt]: startTime },
    },
  });
  return !!overlap;
}

exports.createBooking = async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, title, notes } = req.body;
    if (endTime <= startTime) return res.status(400).json({ message: 'End time must be after start time' });
    if (await isOverlap(roomId, date, startTime, endTime)) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }
    const booking = await Booking.create({
      userId: req.user.id,
      roomId,
      date,
      startTime,
      endTime,
      status: 'pending',
      title,
      notes,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        Room,
        { model: User, as: 'Reviewer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['date', 'DESC']],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getApprovedBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: 'approved' },
      include: [Room, { model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
      order: [['date', 'ASC']],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'User' },
        Room,
        { model: User, as: 'Reviewer', attributes: ['id', 'name', 'email'] },
      ],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = status;
    booking.reviewedBy = req.user.id;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
