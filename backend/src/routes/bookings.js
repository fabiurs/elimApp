const express = require('express');
const { createBooking, getUserBookings, getApprovedBookings } = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken, getUserBookings);
router.get('/calendar', verifyToken, getApprovedBookings);
router.post('/', verifyToken, createBooking);

module.exports = router;
