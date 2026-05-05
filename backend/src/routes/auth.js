const express = require('express');
const { register, login, me, devAdminLogin } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/dev-admin-login', devAdminLogin);
router.get('/me', verifyToken, me);

module.exports = router;
