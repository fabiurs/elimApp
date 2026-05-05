const { Op } = require('sequelize');
const AttendanceRecord = require('../models/AttendanceRecord');
const Event = require('../models/Event');
const EventAssignment = require('../models/EventAssignment');

function startOfDay(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d, days) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(d) {
  const date = startOfDay(d);
  const day = date.getDay();
  return addDays(date, -day);
}

function startOfMonth(d) {
  const date = startOfDay(d);
  date.setDate(1);
  return date;
}

function toDateOnly(d) {
  return d.toISOString().slice(0, 10);
}

function bucketStart(dateStr, period) {
  const d = new Date(`${dateStr}T00:00:00`);
  return period === 'month' ? startOfMonth(d) : startOfWeek(d);
}

exports.getKpis = async (req, res) => {
  try {
    const period = req.query.period === 'month' ? 'month' : 'week';
    const points = Math.min(24, Math.max(4, Number(req.query.points) || 8));

    const end = startOfDay(new Date());
    const start = period === 'month'
      ? startOfMonth(addDays(end, -31 * (points - 1)))
      : startOfWeek(addDays(end, -7 * (points - 1)));

    const [records, eventsCount, assignments] = await Promise.all([
      AttendanceRecord.findAll({
        where: {
          attendanceDate: {
            [Op.gte]: toDateOnly(start),
            [Op.lte]: toDateOnly(end),
          },
        },
      }),
      Event.count({
        where: {
          date: {
            [Op.gte]: toDateOnly(start),
            [Op.lte]: toDateOnly(end),
          },
        },
      }),
      EventAssignment.findAll({
        include: [{
          model: Event,
          as: 'Event',
          where: {
            date: {
              [Op.gte]: toDateOnly(start),
              [Op.lte]: toDateOnly(end),
            },
          },
          attributes: ['id'],
        }],
      }),
    ]);

    const trendMap = new Map();

    records.forEach((record) => {
      const bucketDate = bucketStart(record.attendanceDate, period);
      const key = toDateOnly(bucketDate);
      if (!trendMap.has(key)) {
        trendMap.set(key, {
          periodStart: key,
          eventAttendance: 0,
          volunteerAttendance: 0,
          ministryAttendance: 0,
        });
      }
      const bucket = trendMap.get(key);
      const qty = Number(record.quantity) || 1;
      if (record.category === 'event' && record.status === 'present') bucket.eventAttendance += qty;
      if (record.category === 'volunteer' && record.status === 'present') bucket.volunteerAttendance += qty;
      if (record.category === 'ministry' && record.status === 'present') bucket.ministryAttendance += qty;
    });

    const timeline = [];
    for (let i = points - 1; i >= 0; i -= 1) {
      const cursor = period === 'month'
        ? startOfMonth(addDays(end, -31 * i))
        : startOfWeek(addDays(end, -7 * i));
      const key = toDateOnly(cursor);
      timeline.push(trendMap.get(key) || {
        periodStart: key,
        eventAttendance: 0,
        volunteerAttendance: 0,
        ministryAttendance: 0,
      });
    }

    const assignmentTotals = {
      total: assignments.length,
      confirmed: assignments.filter((a) => a.responseStatus === 'confirmed').length,
      declined: assignments.filter((a) => a.responseStatus === 'declined').length,
    };
    const pending = assignmentTotals.total - assignmentTotals.confirmed - assignmentTotals.declined;

    const ministryTotals = {};
    records
      .filter((r) => r.category === 'ministry' && r.status === 'present')
      .forEach((r) => {
        const key = r.ministry || 'Unknown';
        ministryTotals[key] = (ministryTotals[key] || 0) + (Number(r.quantity) || 1);
      });

    return res.json({
      range: {
        period,
        startDate: toDateOnly(start),
        endDate: toDateOnly(end),
      },
      kpis: {
        eventsTracked: eventsCount,
        eventAttendance: records.filter((r) => r.category === 'event' && r.status === 'present').reduce((sum, r) => sum + (Number(r.quantity) || 1), 0),
        volunteerAttendance: records.filter((r) => r.category === 'volunteer' && r.status === 'present').reduce((sum, r) => sum + (Number(r.quantity) || 1), 0),
        ministryAttendance: records.filter((r) => r.category === 'ministry' && r.status === 'present').reduce((sum, r) => sum + (Number(r.quantity) || 1), 0),
        assignmentsTotal: assignmentTotals.total,
        assignmentsConfirmed: assignmentTotals.confirmed,
        assignmentsDeclined: assignmentTotals.declined,
        assignmentsPending: pending,
        assignmentResponseRate: assignmentTotals.total
          ? Number((((assignmentTotals.confirmed + assignmentTotals.declined) / assignmentTotals.total) * 100).toFixed(2))
          : 0,
      },
      trends: timeline,
      ministryBreakdown: Object.entries(ministryTotals)
        .map(([ministry, attendance]) => ({ ministry, attendance }))
        .sort((a, b) => b.attendance - a.attendance),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
