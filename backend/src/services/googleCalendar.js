const { google } = require('googleapis');

const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

function hasServiceAccountConfig() {
  return !!(GOOGLE_CALENDAR_ID && GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY);
}

function toIsoDateTime(date, time) {
  return `${date}T${time}`;
}

function getGoogleCreateLink(event) {
  const start = toIsoDateTime(event.date, event.startTime);
  const end = toIsoDateTime(event.date, event.endTime);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start.replace(/[-:]/g, '')}Z/${end.replace(/[-:]/g, '')}Z`,
    details: event.description || '',
    location: event.location || event.Room?.name || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function createOrUpdateGoogleEvent(event) {
  if (!hasServiceAccountConfig()) {
    return { synced: false, reason: 'Google service account is not configured' };
  }

  const auth = new google.auth.JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendar = google.calendar({ version: 'v3', auth });
  const body = {
    summary: event.title,
    description: event.description || '',
    location: event.location || event.Room?.name || '',
    start: { dateTime: `${event.date}T${event.startTime}`, timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'UTC' },
    end: { dateTime: `${event.date}T${event.endTime}`, timeZone: process.env.GOOGLE_CALENDAR_TIMEZONE || 'UTC' },
  };

  if (event.googleEventId) {
    const updated = await calendar.events.update({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId: event.googleEventId,
      requestBody: body,
    });
    return { synced: true, googleEventId: updated.data.id };
  }

  const inserted = await calendar.events.insert({
    calendarId: GOOGLE_CALENDAR_ID,
    requestBody: body,
  });
  return { synced: true, googleEventId: inserted.data.id };
}

module.exports = {
  getGoogleCreateLink,
  createOrUpdateGoogleEvent,
  hasServiceAccountConfig,
};
