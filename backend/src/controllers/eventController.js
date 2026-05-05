const { Op } = require('sequelize');
const Event = require('../models/Event');
const EventAssignment = require('../models/EventAssignment');
const User = require('../models/User');
const Room = require('../models/Room');
const VolunteerProfile = require('../models/VolunteerProfile');
const VolunteerAvailability = require('../models/VolunteerAvailability');
const VolunteerBlackout = require('../models/VolunteerBlackout');
const { getGoogleCreateLink, createOrUpdateGoogleEvent } = require('../services/googleCalendar');

const MEDIA_ROLES = ['audio', 'video', 'lyrics'];

async function hasRoomConflict({ roomId, date, startTime, endTime, excludeEventId = null }) {
  if (!roomId) return false;

  const where = {
    roomId,
    date,
    startTime: { [Op.lt]: endTime },
    endTime: { [Op.gt]: startTime },
  };

  if (excludeEventId) {
    where.id = { [Op.ne]: excludeEventId };
  }

  const existing = await Event.findOne({ where });
  return !!existing;
}

function validateAssignments(assignments) {
  if (!assignments || typeof assignments !== 'object') return true;
  return Object.keys(assignments).every((key) => MEDIA_ROLES.includes(key));
}

function normalizeAssignments(assignments = {}) {
  const normalized = {};
  MEDIA_ROLES.forEach((role) => {
    const raw = assignments[role];
    if (raw === null || raw === undefined || raw === '') {
      normalized[role] = null;
      return;
    }
    const id = Number(raw);
    normalized[role] = Number.isFinite(id) && id > 0 ? id : null;
  });
  return normalized;
}

async function saveAssignments(eventId, assignments = {}) {
  await EventAssignment.destroy({ where: { eventId } });

  const rows = Object.entries(assignments)
    .filter(([, userId]) => !!userId)
    .map(([role, userId]) => ({ eventId, role, userId }));

  if (rows.length) {
    await EventAssignment.bulkCreate(rows);
  }
}

async function validateAssignmentUsers(assignments = {}) {
  const userIds = Object.values(assignments).filter(Boolean);
  if (!userIds.length) return true;
  const count = await User.count({ where: { id: { [Op.in]: userIds } } });
  return count === userIds.length;
}

function isTimeRangeWithin(slotStart, slotEnd, eventStart, eventEnd) {
  return slotStart <= eventStart && slotEnd >= eventEnd;
}

function getDirectionsLink(eventLike) {
  const destination = eventLike.location || eventLike.Room?.name || '';
  if (!destination) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

async function getBusyUserIds({ userIds, date, startTime, endTime, excludeEventId = null }) {
  if (!userIds.length) return new Set();

  const where = {
    date,
    startTime: { [Op.lt]: endTime },
    endTime: { [Op.gt]: startTime },
  };

  if (excludeEventId) {
    where.id = { [Op.ne]: excludeEventId };
  }

  const busyAssignments = await EventAssignment.findAll({
    where: { userId: { [Op.in]: userIds } },
    include: [{ model: Event, as: 'Event', where, attributes: ['id'] }],
  });

  return new Set(busyAssignments.map((assignment) => assignment.userId));
}

async function buildAutoSuggestions({
  date,
  startTime,
  endTime,
  excludeEventId = null,
  lockedAssignments = {},
}) {
  const weekday = new Date(`${date}T00:00:00`).getDay();

  const profiles = await VolunteerProfile.findAll({
    where: { autoAssignable: true },
    include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email', 'role'] }],
  });

  const userIds = profiles.map((profile) => profile.userId);
  const [availabilities, blackouts, busyUserIds] = await Promise.all([
    VolunteerAvailability.findAll({
      where: {
        userId: { [Op.in]: userIds },
        dayOfWeek: weekday,
      },
    }),
    VolunteerBlackout.findAll({
      where: {
        userId: { [Op.in]: userIds },
        startDate: { [Op.lte]: date },
        endDate: { [Op.gte]: date },
      },
    }),
    getBusyUserIds({ userIds, date, startTime, endTime, excludeEventId }),
  ]);

  const availabilityByUser = new Map();
  availabilities.forEach((slot) => {
    const list = availabilityByUser.get(slot.userId) || [];
    list.push(slot);
    availabilityByUser.set(slot.userId, list);
  });

  const blackoutUserIds = new Set(blackouts.map((entry) => entry.userId));
  const userById = new Map();
  profiles.forEach((profile) => {
    if (profile.User) {
      userById.set(profile.userId, {
        id: profile.User.id,
        name: profile.User.name,
        email: profile.User.email,
        preferredRoles: Array.isArray(profile.preferredRoles) ? profile.preferredRoles : [],
      });
    }
  });

  const assignedUserIds = new Set(Object.values(lockedAssignments).filter(Boolean));
  const suggestions = { audio: null, video: null, lyrics: null };

  MEDIA_ROLES.forEach((role) => {
    if (lockedAssignments[role]) {
      suggestions[role] = lockedAssignments[role];
      return;
    }

    const candidates = [];
    userById.forEach((candidate, userId) => {
      if (assignedUserIds.has(userId)) return;
      if (blackoutUserIds.has(userId)) return;
      if (busyUserIds.has(userId)) return;

      const slots = availabilityByUser.get(userId) || [];
      const isAvailable = slots.some((slot) => isTimeRangeWithin(slot.startTime, slot.endTime, startTime, endTime));
      if (!isAvailable) return;

      const preferenceBoost = candidate.preferredRoles.includes(role) ? 100 : 0;
      const fairnessScore = -(slots.length);
      const score = preferenceBoost + fairnessScore;

      candidates.push({ userId, score, candidate });
    });

    candidates.sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name));
    if (candidates[0]) {
      suggestions[role] = candidates[0].userId;
      assignedUserIds.add(candidates[0].userId);
    }
  });

  const suggestedUsers = {};
  MEDIA_ROLES.forEach((role) => {
    const userId = suggestions[role];
    suggestedUsers[role] = userId ? userById.get(userId) || null : null;
  });

  return { suggestions, suggestedUsers };
}

function toEventDto(event) {
  const plain = event.toJSON ? event.toJSON() : event;
  const assignmentMap = { audio: null, video: null, lyrics: null };
  (plain.Assignments || []).forEach((a) => {
    assignmentMap[a.role] = a.Assignee
      ? {
        id: a.Assignee.id,
        name: a.Assignee.name,
        email: a.Assignee.email,
        responseStatus: a.responseStatus,
        respondedAt: a.respondedAt,
      }
      : null;
  });
  return {
    ...plain,
    assignments: assignmentMap,
    googleCalendarUrl: getGoogleCreateLink(plain),
    directionsUrl: getDirectionsLink(plain),
  };
}

exports.getAssignableUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAutoAssignmentSuggestions = async (req, res) => {
  try {
    const {
      eventId,
      date,
      startTime,
      endTime,
      assignments,
    } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'date, startTime and endTime are required' });
    }
    if (endTime <= startTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    if (!validateAssignments(assignments)) {
      return res.status(400).json({ message: 'Assignments contain invalid roles' });
    }

    const normalizedAssignments = normalizeAssignments(assignments || {});

    const { suggestions, suggestedUsers } = await buildAutoSuggestions({
      date,
      startTime,
      endTime,
      excludeEventId: eventId || null,
      lockedAssignments: normalizedAssignments,
    });

    return res.json({ suggestions, suggestedUsers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      date,
      startTime,
      endTime,
      location,
      roomId,
      status,
      assignments,
      syncToGoogle,
    } = req.body;

    if (!title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, date, startTime and endTime are required' });
    }
    if (endTime <= startTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    if (!validateAssignments(assignments)) {
      return res.status(400).json({ message: 'Assignments contain invalid roles' });
    }
    if (!(await validateAssignmentUsers(assignments))) {
      return res.status(400).json({ message: 'Assignments include unknown users' });
    }
    if (await hasRoomConflict({ roomId, date, startTime, endTime })) {
      return res.status(409).json({ message: 'Room already has an event in this time window' });
    }

    const event = await Event.create({
      title,
      description,
      eventType: eventType || 'service',
      date,
      startTime,
      endTime,
      location,
      roomId: roomId || null,
      status: status || 'scheduled',
      createdBy: req.user.id,
    });

    await saveAssignments(event.id, assignments);

    let googleSync = { synced: false, reason: 'Sync skipped' };
    if (syncToGoogle) {
      try {
        const withRoom = await Event.findByPk(event.id, { include: [{ model: Room, as: 'Room' }] });
        googleSync = await createOrUpdateGoogleEvent(withRoom);
        if (googleSync.synced && googleSync.googleEventId) {
          withRoom.googleEventId = googleSync.googleEventId;
          await withRoom.save();
        }
      } catch (err) {
        googleSync = { synced: false, reason: err.message };
      }
    }

    const created = await Event.findByPk(event.id, {
      include: [
        { model: Room, as: 'Room' },
        { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
        {
          model: EventAssignment,
          as: 'Assignments',
          include: [{ model: User, as: 'Assignee', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    res.status(201).json({ event: toEventDto(created), googleSync });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, { include: [{ model: Room, as: 'Room' }] });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const {
      title,
      description,
      eventType,
      date,
      startTime,
      endTime,
      location,
      roomId,
      status,
      assignments,
      syncToGoogle,
    } = req.body;

    const nextDate = date !== undefined ? date : event.date;
    const nextStartTime = startTime !== undefined ? startTime : event.startTime;
    const nextEndTime = endTime !== undefined ? endTime : event.endTime;
    const nextRoomId = roomId !== undefined ? (roomId || null) : event.roomId;

    if (nextEndTime <= nextStartTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    if (assignments && !validateAssignments(assignments)) {
      return res.status(400).json({ message: 'Assignments contain invalid roles' });
    }
    if (assignments && !(await validateAssignmentUsers(assignments))) {
      return res.status(400).json({ message: 'Assignments include unknown users' });
    }
    if (await hasRoomConflict({
      roomId: nextRoomId,
      date: nextDate,
      startTime: nextStartTime,
      endTime: nextEndTime,
      excludeEventId: event.id,
    })) {
      return res.status(409).json({ message: 'Room already has an event in this time window' });
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (eventType !== undefined) event.eventType = eventType;
    if (date !== undefined) event.date = date;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (location !== undefined) event.location = location;
    if (roomId !== undefined) event.roomId = roomId || null;
    if (status !== undefined) event.status = status;

    await event.save();

    if (assignments) {
      await saveAssignments(event.id, assignments);
    }

    let googleSync = { synced: false, reason: 'Sync skipped' };
    if (syncToGoogle) {
      try {
        googleSync = await createOrUpdateGoogleEvent(event);
        if (googleSync.synced && googleSync.googleEventId) {
          event.googleEventId = googleSync.googleEventId;
          await event.save();
        }
      } catch (err) {
        googleSync = { synced: false, reason: err.message };
      }
    }

    const updated = await Event.findByPk(event.id, {
      include: [
        { model: Room, as: 'Room' },
        { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
        {
          model: EventAssignment,
          as: 'Assignments',
          include: [{ model: User, as: 'Assignee', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    res.json({ event: toEventDto(updated), googleSync });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const events = await Event.findAll({
      where,
      include: [
        { model: Room, as: 'Room' },
        { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
        {
          model: EventAssignment,
          as: 'Assignments',
          include: [{ model: User, as: 'Assignee', attributes: ['id', 'name', 'email'] }],
        },
      ],
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC'],
      ],
    });

    res.json(events.map(toEventDto));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyAssignments = async (req, res) => {
  try {
    const assignments = await EventAssignment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Event,
          as: 'Event',
          include: [{ model: Room, as: 'Room' }],
        },
      ],
      order: [[{ model: Event, as: 'Event' }, 'date', 'ASC']],
    });

    res.json(assignments.map((a) => ({
      id: a.id,
      role: a.role,
      responseStatus: a.responseStatus,
      respondedAt: a.respondedAt,
      event: {
        ...a.Event.toJSON(),
        googleCalendarUrl: getGoogleCreateLink(a.Event),
        directionsUrl: getDirectionsLink(a.Event),
      },
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTodayAssignments = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const assignments = await EventAssignment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Event,
          as: 'Event',
          where: { date: today },
          include: [{ model: Room, as: 'Room' }],
        },
      ],
      order: [[{ model: Event, as: 'Event' }, 'startTime', 'ASC']],
    });

    res.json(assignments.map((a) => ({
      id: a.id,
      role: a.role,
      responseStatus: a.responseStatus,
      respondedAt: a.respondedAt,
      event: {
        ...a.Event.toJSON(),
        googleCalendarUrl: getGoogleCreateLink(a.Event),
        directionsUrl: getDirectionsLink(a.Event),
      },
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.respondToAssignment = async (req, res) => {
  try {
    const { responseStatus } = req.body;
    if (!['confirmed', 'declined'].includes(responseStatus)) {
      return res.status(400).json({ message: 'responseStatus must be confirmed or declined' });
    }

    const assignment = await EventAssignment.findByPk(req.params.assignmentId, {
      include: [{ model: Event, as: 'Event', include: [{ model: Room, as: 'Room' }] }],
    });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to update this assignment' });
    }

    assignment.responseStatus = responseStatus;
    assignment.respondedAt = new Date();
    await assignment.save();

    return res.json({
      id: assignment.id,
      role: assignment.role,
      responseStatus: assignment.responseStatus,
      respondedAt: assignment.respondedAt,
      event: {
        ...assignment.Event.toJSON(),
        googleCalendarUrl: getGoogleCreateLink(assignment.Event),
        directionsUrl: getDirectionsLink(assignment.Event),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await EventAssignment.destroy({ where: { eventId: event.id } });
    await event.destroy();

    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
