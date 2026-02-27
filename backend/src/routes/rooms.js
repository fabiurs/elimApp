const express = require('express');
const { getRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken, getRooms);
router.post('/', verifyToken, isAdmin, createRoom);
router.put('/:id', verifyToken, isAdmin, updateRoom);
router.delete('/:id', verifyToken, isAdmin, deleteRoom);

module.exports = router;
