const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Replace all Mongoose logic with Sequelize for PostgreSQL
// Helper to strip password_hash from user object
function safeUser(user) {
  const { password_hash, ...safe } = user.toJSON ? user.toJSON() : user;
  return safe;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password_hash: hash, role: 'user' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: safeUser(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.devAdminLogin = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Disabled in production' });
    }

    const admin = await User.findOne({ where: { role: 'admin' }, order: [['id', 'ASC']] });
    if (!admin) {
      return res.status(404).json({ message: 'No admin user found' });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, user: safeUser(admin) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
