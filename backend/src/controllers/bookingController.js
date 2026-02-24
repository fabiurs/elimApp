const Booking = require('../models/Booking');
const User = require('../models/User');
const Room = require('../models/Room');

// Overlap check helper
async function isOverlap(roomId, date, startTime, endTime) {
  const overlap = await Booking.findOne({
    where: {
      roomId,
      date,
      status: 'approved',
      [Booking.sequelize.Op.or]: [
        { startTime: { [Booking.sequelize.Op.lt]: endTime }, endTime: { [Booking.sequelize.Op.gt]: startTime } },
      ],
    },
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
      userId: req.user.id,
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
    const bookings = await Booking.findAll({ include: [User, Room] });
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
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
