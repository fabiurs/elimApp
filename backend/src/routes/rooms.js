const express = require('express');
const { getRooms, createRoom, deleteRoom } = require('../controllers/roomController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken, getRooms);
router.post('/', verifyToken, isAdmin, createRoom);
router.delete('/:id', verifyToken, isAdmin, deleteRoom);

module.exports = router;
