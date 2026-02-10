const express = require('express');
const { getRooms } = require('../controllers/roomController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken, getRooms);

module.exports = router;
