const express = require('express');
const { getAllBookings, updateBookingStatus } = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/bookings', verifyToken, isAdmin, getAllBookings);
router.patch('/bookings/:id', verifyToken, isAdmin, updateBookingStatus);

module.exports = router;
