const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin access required' });
  next();
};

module.exports = { verifyToken, isAdmin };
