const { Op } = require('sequelize');
const AttendanceRecord = require('../models/AttendanceRecord');
const Event = require('../models/Event');
const User = require('../models/User');

function normalizeDate(input) {
  if (!input) return new Date().toISOString().slice(0, 10);
  return input;
}

exports.upsertAttendanceRecord = async (req, res) => {
  try {
    const {
      eventId,
      userId,
      attendanceDate,
      category,
      ministry,
      status,
      quantity,
      notes,
      checkInAt,
    } = req.body;

    if (!category || !['event', 'volunteer', 'ministry'].includes(category)) {
      return res.status(400).json({ message: 'Valid category is required' });
    }

    if (status && !['present', 'absent', 'late', 'excused'].includes(status)) {
      return res.status(400).json({ message: 'Invalid attendance status' });
    }

    const date = normalizeDate(attendanceDate);
    const safeQuantity = Math.max(1, Number(quantity) || 1);

    const where = {
      eventId: eventId || null,
      userId: userId || null,
      attendanceDate: date,
      category,
      ministry: ministry || null,
    };

    let record = await AttendanceRecord.findOne({ where });
    if (!record) {
      record = await AttendanceRecord.create({
        ...where,
        status: status || 'present',
        quantity: safeQuantity,
        notes: notes || null,
        checkInAt: checkInAt || new Date(),
      });
    } else {
      if (status !== undefined) record.status = status;
      if (quantity !== undefined) record.quantity = safeQuantity;
      if (notes !== undefined) record.notes = notes || null;
      if (checkInAt !== undefined) record.checkInAt = checkInAt || null;
      await record.save();
    }

    const payload = await AttendanceRecord.findByPk(record.id, {
      include: [
        { model: Event, as: 'Event', attributes: ['id', 'title', 'date', 'startTime', 'endTime'] },
        { model: User, as: 'User', attributes: ['id', 'name', 'email'] },
      ],
    });

    return res.json(payload);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.getAttendanceRecords = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.attendanceDate = {};
      if (startDate) where.attendanceDate[Op.gte] = startDate;
      if (endDate) where.attendanceDate[Op.lte] = endDate;
    }

    if (category) {
      where.category = category;
    }

    const records = await AttendanceRecord.findAll({
      where,
      include: [
        { model: Event, as: 'Event', attributes: ['id', 'title', 'date'] },
        { model: User, as: 'User', attributes: ['id', 'name', 'email'] },
      ],
      order: [['attendanceDate', 'DESC'], ['createdAt', 'DESC']],
      limit: 500,
    });

    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
