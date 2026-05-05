const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getKpis } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/kpis', verifyToken, isAdmin, getKpis);

module.exports = router;
