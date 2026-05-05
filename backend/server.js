const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connectDB, sequelize } = require('./src/config/db');

dotenv.config();

const app = express();

// Log all incoming requests for debugging
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
	next();
});

app.use(helmet());
app.use(cors());
app.use(express.json());

connectDB();

// After all models are imported and defined
require('./src/models/Event');
require('./src/models/EventAssignment');
require('./src/models/VolunteerProfile');
require('./src/models/VolunteerAvailability');
require('./src/models/VolunteerBlackout');
require('./src/models/AttendanceRecord');
sequelize.sync();

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/rooms', require('./src/routes/rooms'));
app.use('/api/bookings', require('./src/routes/bookings'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/profile', require('./src/routes/profile'));
app.use('/api/attendance', require('./src/routes/attendance'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/admin', require('./src/routes/admin'));

app.get('/', (req, res) => res.send('CBS API running'));

const PORT = process.env.PORT || 5000;
console.log('About to call app.listen');
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log('app.listen callback executed');
});
console.log('After app.listen call');
