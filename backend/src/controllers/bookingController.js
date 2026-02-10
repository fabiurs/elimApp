const Booking = require('../models/Booking');

// Overlap check helper
async function isOverlap(roomId, date, startTime, endTime) {
  const overlap = await Booking.findOne({
    roomId,
    date,
    status: 'approved',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  });
  return !!overlap;
}

exports.createBooking = async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, notes } = req.body;
    if (endTime <= startTime) return res.status(400).json({ message: 'End time must be after start time' });
    if (await isOverlap(roomId, date, startTime, endTime)) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }
    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      date,
      startTime,
      endTime,
      status: 'pending',
      notes,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId').populate('roomId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
