const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getMyProfile, updateMyProfile } = require('../controllers/profileController');

const router = express.Router();

router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);

module.exports = router;
