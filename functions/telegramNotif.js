const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

const db = admin.firestore();

const botToken = functions.config().telegram.bot_token;
const chatIds = ['-1002175083787']; // Updated chat ID

exports.botWebhook = functions.region('asia-northeast3').https.onRequest(async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;
    if (message && message.text) {
      await handleMessage(message);
    }
  }
  res.sendStatus(200);
});

async function handleMessage(message) {
  const { chat, text } = message;

  if (text.startsWith('/')) {
    const [command, ...args] = text.split(' ');
    switch (command) {
      case '/events':
        await sendUpcomingEventsList(chat.id);
        break;
      case '/eventstoday':
        await sendTodayEventsList(chat.id);
        break;
      case '/eventsweek':
        await sendEventsWeekList(chat.id);
        break;
      case '/help':
        await sendHelpMessage(chat.id);
        break;
      default:
        await sendMessage(chat.id, "Sorry, I don't understand that command.");
    }
  }
}

async function sendUpcomingEventsList(chatId) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  const startTimestamp = admin.firestore.Timestamp.fromDate(startOfToday);
  const endTimestamp = admin.firestore.Timestamp.fromDate(endOfYear);

  const events = await getUpcomingEvents(startTimestamp, endTimestamp);
  
  if (events.length > 0) {
    const message = `Upcoming Events:\n\n${events.map(event =>
      `- Event Date: ${event.eventDate} ${event.eventDay}\n  Event Time: ${event.eventTime}\n  Event Venue: ${event.venue}\n  Client: ${event.clientName}\n  Contact: ${event.clientNumber}\n  Service: ${event.service}\n  Staff: ${event.staffs.length ? event.staffs.join(' & ') : 'No assigned staffs yet'}\n  Added by: ${event.addedBy}`
    ).join('\n\n')}`;
    await sendMessage(chatId, message);
  } else {
    await sendMessage(chatId, "No upcoming events scheduled.");
  }
}

async function sendTodayEventsList(chatId) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const startTimestamp = admin.firestore.Timestamp.fromDate(startOfToday);
  const endTimestamp = admin.firestore.Timestamp.fromDate(endOfToday);

  const events = await getEventsForToday(startTimestamp, endTimestamp);
  
  if (events.length > 0) {
    const message = `Today's Events:\n\n${events.map(event =>
      `- Event Date: ${event.eventDate} ${event.eventDay}\n  Event Time: ${event.eventTime}\n  Event Venue: ${event.venue}\n  Client: ${event.clientName}\n  Contact: ${event.clientNumber}\n  Service: ${event.service}\n  Staff: ${event.staffs.length ? event.staffs.join(' & ') : 'No assigned staffs yet'}\n  Added by: ${event.addedBy}`
    ).join('\n\n')}`;
    await sendMessage(chatId, message);
  } else {
    await sendMessage(chatId, "No events scheduled for today.");
  }
}

async function sendEventsWeekList(chatId) {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6, 23, 59, 59);

  const startTimestamp = admin.firestore.Timestamp.fromDate(startOfWeek);
  const endTimestamp = admin.firestore.Timestamp.fromDate(endOfWeek);

  const events = await getEventsForWeek(startTimestamp, endTimestamp);
  
  if (events.length > 0) {
    const message = `Events for this week:\n\n${events.map(event =>
      `- Event Date: ${event.eventDate} ${event.eventDay}\n  Event Time: ${event.eventTime}\n  Event Venue: ${event.venue}\n  Client: ${event.clientName}\n  Contact: ${event.clientNumber}\n  Service: ${event.service}\n  Staff: ${event.staffs.length ? event.staffs.join(' & ') : 'No assigned staffs yet'}\n  Added by: ${event.addedBy}`
    ).join('\n\n')}`;
    await sendMessage(chatId, message);
  } else {
    await sendMessage(chatId, "No events scheduled for this week.");
  }
}

async function sendHelpMessage(chatId) {
  const helpMessage = `
Available commands:
/events - List all upcoming events
/eventstoday - List today's events
/eventsweek - List events for this week
/help - Show this help message
  `;
  await sendMessage(chatId, helpMessage);
}

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

const getUpcomingEvents = async (startTimestamp, endTimestamp) => {
  const snapshot = await db.collection('appointments')
    .where('aptDate', '>=', startTimestamp)
    .where('aptDate', '<=', endTimestamp)
    .get();

  if (snapshot.empty) {
    console.log('No upcoming events found.');
    return [];
  }

  const events = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.deleted) {
      let aptDate = data.aptDate && data.aptDate.toDate ? data.aptDate.toDate() : new Date(data.aptDate);
      let eventDay = aptDate.toLocaleDateString('en-US', { weekday: 'long' });
      events.push({
        eventDate: aptDate.toLocaleDateString(),
        eventDay: eventDay,
        eventTime: data.eventTime || 'N/A',
        clientName: data.clientName || 'N/A',
        clientNumber: data.clientNumber || 'N/A',
        venue: data.venue || 'N/A',
        service: data.service || 'N/A',
        staffs: data.staffs || [],
        addedBy: data.addedBy || 'N/A'
      });
    }
  });

  return events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
};

const getEventsForToday = async (startTimestamp, endTimestamp) => {
  return getUpcomingEvents(startTimestamp, endTimestamp);
};

const getEventsForWeek = async (startTimestamp, endTimestamp) => {
  return getUpcomingEvents(startTimestamp, endTimestamp);
};

const sendNotifications = async (events, title) => {
  const message = events.length > 0
    ? `${title}\n\n${events.map(event =>
        `- Event Date: ${event.eventDate} ${event.eventDay}\n  Time: ${event.eventTime}\n  Event Venue: ${event.venue}\n  Client: ${event.clientName}\n  Contact: ${event.clientNumber}\n  Service: ${event.service}\n  Staff: ${event.staffs.length ? event.staffs.join(' & ') : 'No assigned staffs yet'}`
      ).join('\n\n')}`
    : `${title}\n\n*NO EVENTS FOR TODAY*`;

  const promises = chatIds.map(chatId => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
  });

  await Promise.all(promises);
  console.log('Messages sent successfully');
};

exports.sendTelegramNotificationUpcoming = functions.region('asia-northeast3').pubsub.schedule('0 7 * * *').timeZone('Asia/Manila').onRun(async (context) => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfYear = new Date(now.getFullYear(), 11, 31); // December 31st of the current year
  const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
  const todayDateString = `Today is ${now.toLocaleDateString()} ${dayOfWeek}`;

  const startTimestamp = admin.firestore.Timestamp.fromDate(today);
  const endTimestamp = admin.firestore.Timestamp.fromDate(endOfYear);

  const events = await getUpcomingEvents(startTimestamp, endTimestamp);
  await sendNotifications(events, `${todayDateString}\n\nUpcoming Events:`);
});

exports.sendTelegramNotificationToday = functions.region('asia-northeast3').pubsub.schedule('0 6 * * *').timeZone('Asia/Manila').onRun(async (context) => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
  const todayDateString = `Events for Today ${now.toLocaleDateString()} ${dayOfWeek}`;

  const startTimestamp = admin.firestore.Timestamp.fromDate(todayStart);
  const endTimestamp = admin.firestore.Timestamp.fromDate(todayEnd);

  const events = await getEventsForToday(startTimestamp, endTimestamp);
  await sendNotifications(events, todayDateString);
});

exports.sendNewEventNotification = functions.region('asia-northeast3').firestore.document('appointments/{appointmentId}').onCreate(async (snap, context) => {
  const data = snap.data();

  let eventDate;
  if (data.eventDate && data.eventDate.toDate) {
    eventDate = data.eventDate.toDate().toLocaleDateString();
  } else if (data.eventDate) {
    eventDate = new Date(data.eventDate).toLocaleDateString();
  } else {
    eventDate = 'N/A';
  }
  const eventDay = new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long' });

  const eventTime = data.eventTime || 'N/A';
  const clientName = data.clientName || 'N/A';
  const clientNumber = data.clientNumber || 'N/A';
  const venue = data.venue || 'N/A';
  const addedBy = data.addedBy || 'N/A';
  const staffs = data.staffs || [];

  const message = `New Event Booking Added:\n\n- Event Date: ${eventDate} ${eventDay}\n- Event Time: ${eventTime}\n- Event Venue: ${venue}\n- Client: ${clientName}\n  Contact: ${clientNumber}\n- Staff: ${staffs.length ? staffs.join(' & ') : 'No assigned staffs yet'}\n- Added by: ${addedBy}`;

  const promises = chatIds.map(chatId => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
  });

  await Promise.all(promises);
  console.log('New event booking message sent successfully');
});

exports.sendUpdatedEventNotification = functions.region('asia-northeast3').firestore.document('appointments/{appointmentId}').onUpdate(async (change, context) => {
  const data = change.after.data();
  const previousData = change.before.data();

  // If the event is marked as deleted, do not send an update notification
  if (data.deleted && !previousData.deleted) {
    // This event has been deleted, do not send update notification
    return;
  }

  let eventDate;
  if (data.eventDate && data.eventDate.toDate) {
    eventDate = data.eventDate.toDate().toLocaleDateString();
  } else if (data.eventDate) {
    eventDate = new Date(data.eventDate).toLocaleDateString();
  } else {
    eventDate = 'N/A';
  }
  const eventDay = new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long' });

  const eventTime = data.eventTime || 'N/A';
  const clientName = data.clientName || 'N/A';
  const clientNumber = data.clientNumber || 'N/A';
  const venue = data.venue || 'N/A';
  const updatedBy = data.updatedBy || 'N/A';
  const updateDate = data.updateDate ? data.updateDate.toDate().toLocaleDateString() : 'N/A';
  const staffs = data.staffs || [];

  const message = `Event Booking Updated:\n\n- Event Date: ${eventDate} ${eventDay}\n- Event Time: ${eventTime}\n- Event Venue: ${venue}\n- Client: ${clientName}\n  Contact: ${clientNumber}\n- Staff: ${staffs.length ? staffs.join(' & ') : 'No assigned staffs yet'}\n- Updated by: ${updatedBy}\n- Update Date: ${updateDate}`;

  const promises = chatIds.map(chatId => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
  });

  await Promise.all(promises);
  console.log('Updated event booking message sent successfully');
});

exports.sendDeletedEventNotification = functions.region('asia-northeast3').firestore.document('appointments/{appointmentId}').onUpdate(async (change, context) => {
  const data = change.after.data();
  const previousData = change.before.data();

  // Only send deletion notification if the event has been marked as deleted
  if (data.deleted && !previousData.deleted) {
    let eventDate;
    if (data.eventDate && data.eventDate.toDate) {
      eventDate = data.eventDate.toDate().toLocaleDateString();
    } else if (data.eventDate) {
      eventDate = new Date(data.eventDate).toLocaleDateString();
    } else {
      eventDate = 'N/A';
    }
    const eventDay = new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long' });

    const eventTime = data.eventTime || 'N/A';
    const clientName = data.clientName || 'N/A';
    const clientNumber = data.clientNumber || 'N/A';
    const venue = data.venue || 'N/A';
    const deletedBy = data.deletedBy || 'N/A';
    const deleteDate = data.deleted ? data.deleted.toDate().toLocaleDateString() : 'N/A';
    const staffs = data.staffs || [];

    const message = `Event Booking Deleted:\n\n- Event Date: ${eventDate} ${eventDay}\n- Event Time: ${eventTime}\n- Event Venue: ${venue}\n- Client: ${clientName}\n  Contact: ${clientNumber}\n- Staff: ${staffs.length ? staffs.join(' & ') : 'No assigned staffs yet'}\n- Deleted by: ${deletedBy}\n- Delete Date: ${deleteDate}`;

    const promises = chatIds.map(chatId => {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      });
    });

    await Promise.all(promises);
    console.log('Deleted event booking message sent successfully');
  }
});

module.exports = {
  botWebhook: exports.botWebhook,
  sendTelegramNotificationUpcoming: exports.sendTelegramNotificationUpcoming,
  sendTelegramNotificationToday: exports.sendTelegramNotificationToday,
  sendNewEventNotification: exports.sendNewEventNotification,
  sendUpdatedEventNotification: exports.sendUpdatedEventNotification,
  sendDeletedEventNotification: exports.sendDeletedEventNotification,
  handleMessage,
  sendUpcomingEventsList,
  sendTodayEventsList,
  sendEventsWeekList,
  getUpcomingEvents,
  getEventsForToday,
  getEventsForWeek,
};
