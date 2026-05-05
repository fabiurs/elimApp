const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upsertAttendanceRecord, getAttendanceRecords } = require('../controllers/attendanceController');

const router = express.Router();

router.get('/records', verifyToken, isAdmin, getAttendanceRecords);
router.post('/records', verifyToken, isAdmin, upsertAttendanceRecord);

module.exports = router;
