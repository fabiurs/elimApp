const express = require('express');
const { createBooking } = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post('/', verifyToken, createBooking);

module.exports = router;
