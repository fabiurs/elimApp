const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const VolunteerAvailability = require('../models/VolunteerAvailability');
const VolunteerBlackout = require('../models/VolunteerBlackout');

const MEDIA_ROLES = ['audio', 'video', 'lyrics'];

function sanitizeRoles(roles) {
  if (!Array.isArray(roles)) return [];
  return [...new Set(roles.filter((role) => MEDIA_ROLES.includes(role)))];
}

function validateAvailabilities(availabilities) {
  if (!Array.isArray(availabilities)) return false;
  return availabilities.every((slot) => {
    if (typeof slot !== 'object' || slot === null) return false;
    const dayOfWeek = Number(slot.dayOfWeek);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) return false;
    if (!slot.startTime || !slot.endTime) return false;
    return slot.endTime > slot.startTime;
  });
}

function validateBlackouts(blackouts) {
  if (!Array.isArray(blackouts)) return false;
  return blackouts.every((entry) => {
    if (typeof entry !== 'object' || entry === null) return false;
    if (!entry.startDate || !entry.endDate) return false;
    return entry.endDate >= entry.startDate;
  });
}

async function buildProfileResponse(userId) {
  const user = await User.findByPk(userId, { attributes: ['id', 'name', 'email', 'role'] });
  const profile = await VolunteerProfile.findOne({ where: { userId } });
  const availabilities = await VolunteerAvailability.findAll({
    where: { userId },
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
  });
  const blackouts = await VolunteerBlackout.findAll({
    where: { userId },
    order: [['startDate', 'ASC']],
  });

  return {
    user,
    profile: {
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      autoAssignable: profile ? profile.autoAssignable : true,
      preferredRoles: profile?.preferredRoles || [],
    },
    availabilities,
    blackouts,
  };
}

exports.getMyProfile = async (req, res) => {
  try {
    const payload = await buildProfileResponse(req.user.id);
    return res.json(payload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { phone, bio, autoAssignable, preferredRoles, availabilities, blackouts } = req.body;

    let profile = await VolunteerProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await VolunteerProfile.create({ userId: req.user.id });
    }

    if (phone !== undefined) profile.phone = phone;
    if (bio !== undefined) profile.bio = bio;
    if (autoAssignable !== undefined) profile.autoAssignable = !!autoAssignable;
    if (preferredRoles !== undefined) profile.preferredRoles = sanitizeRoles(preferredRoles);

    await profile.save();

    if (availabilities !== undefined) {
      if (!validateAvailabilities(availabilities)) {
        return res.status(400).json({ message: 'Invalid availability entries' });
      }
      await VolunteerAvailability.destroy({ where: { userId: req.user.id } });
      const rows = availabilities.map((slot) => ({
        userId: req.user.id,
        dayOfWeek: Number(slot.dayOfWeek),
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
      if (rows.length) {
        await VolunteerAvailability.bulkCreate(rows);
      }
    }

    if (blackouts !== undefined) {
      if (!validateBlackouts(blackouts)) {
        return res.status(400).json({ message: 'Invalid blackout entries' });
      }
      await VolunteerBlackout.destroy({ where: { userId: req.user.id } });
      const rows = blackouts.map((entry) => ({
        userId: req.user.id,
        startDate: entry.startDate,
        endDate: entry.endDate,
        reason: entry.reason || null,
      }));
      if (rows.length) {
        await VolunteerBlackout.bulkCreate(rows);
      }
    }

    const payload = await buildProfileResponse(req.user.id);
    return res.json(payload);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
