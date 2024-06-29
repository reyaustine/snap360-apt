const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

const db = admin.firestore();

const botToken = '7026079422:AAGFCWOnD2WcVNQSiWI_ej3p7bufEeiKY04';
const chatIds = ['-1002175083787']; // Updated chat ID

const sendNotifications = async (events, title) => {
  const message = events.length > 0
    ? `${title}\n\n${events.map(event =>
        `- Event Date: ${event.eventDate}\n  Time: ${event.eventTime}\n  Client: ${event.clientName}\n  Contact: ${event.clientNumber}\n  Service: ${event.service}`
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

const getEventsForToday = async (startTimestamp, endTimestamp) => {
  const snapshot = await db.collection('appointments')
    .where('aptDate', '>=', startTimestamp)
    .where('aptDate', '<=', endTimestamp)
    .get();

  if (snapshot.empty) {
    console.log('No events for today found.');
    return [];
  }

  const events = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.deleted) {
      let aptDate;
      let eventDate;

      // Check if aptDate is a Firestore Timestamp
      if (data.aptDate && data.aptDate.toDate) {
        aptDate = data.aptDate.toDate();
      } else if (data.aptDate) {
        // If aptDate is a string or other format
        aptDate = new Date(data.aptDate);
      } else {
        aptDate = 'N/A';
      }

      // Check if eventDate is a Firestore Timestamp
      if (data.eventDate && data.eventDate.toDate) {
        eventDate = data.eventDate.toDate();
      } else if (data.eventDate) {
        // If eventDate is a string or other format
        eventDate = new Date(data.eventDate);
      } else {
        eventDate = 'N/A';
      }

      if (aptDate !== 'N/A' && aptDate.toLocaleDateString() === startTimestamp.toDate().toLocaleDateString()) { // Ensure we only include today's events
        events.push({
          eventDate: eventDate !== 'N/A' ? eventDate.toLocaleDateString() : 'N/A',
          eventTime: data.eventTime || 'N/A',
          clientName: data.clientName || 'N/A',
          clientNumber: data.clientNumber || 'N/A',
          service: data.service || 'N/A'
        });
      }
    }
  });

  return events;
};

const getUpcomingEvents = async (startTimestamp, endTimestamp) => {
  const snapshot = await db.collection('appointments')
    .where('aptDate', '>=', startTimestamp)
    .get();

  if (snapshot.empty) {
    console.log('No upcoming events found.');
    return [];
  }

  const events = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.deleted) {
      let aptDate;
      let eventDate;

      // Check if aptDate is a Firestore Timestamp
      if (data.aptDate && data.aptDate.toDate) {
        aptDate = data.aptDate.toDate();
      } else if (data.aptDate) {
        // If aptDate is a string or other format
        aptDate = new Date(data.aptDate);
      } else {
        aptDate = 'N/A';
      }

      // Check if eventDate is a Firestore Timestamp
      if (data.eventDate && data.eventDate.toDate) {
        eventDate = data.eventDate.toDate();
      } else if (data.eventDate) {
        // If eventDate is a string or other format
        eventDate = new Date(data.eventDate);
      } else {
        eventDate = 'N/A';
      }

      if (aptDate !== 'N/A') { // Ensure we don't include past dates
        events.push({
          eventDate: eventDate !== 'N/A' ? eventDate.toLocaleDateString() : 'N/A',
          eventTime: data.eventTime || 'N/A',
          clientName: data.clientName || 'N/A',
          clientNumber: data.clientNumber || 'N/A',
          service: data.service || 'N/A'
        });
      }
    }
  });

  return events;
};

exports.sendTelegramNotificationUpcoming = functions.region('asia-northeast3').pubsub.schedule('0 7 * * *').timeZone('Asia/Manila').onRun(async (context) => {
  const now = new Date();
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
  const now = new Date();
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

  const eventTime = data.eventTime || 'N/A';
  const clientName = data.clientName || 'N/A';
  const clientNumber = data.clientNumber || 'N/A';
  const venue = data.venue || 'N/A';
  const addedBy = data.addedBy || 'N/A';

  const message = `New Event Booking Added:\n\n- Event Date: ${eventDate}\n- Event Time: ${eventTime}\n- Event Venue: ${venue}\n- Client: ${clientName}\n  Contact: ${clientNumber}\n- Added by: ${addedBy}`;

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

  let eventDate;
  if (data.eventDate && data.eventDate.toDate) {
    eventDate = data.eventDate.toDate().toLocaleDateString();
  } else if (data.eventDate) {
    eventDate = new Date(data.eventDate).toLocaleDateString();
  } else {
    eventDate = 'N/A';
  }

  const eventTime = data.eventTime || 'N/A';
  const clientName = data.clientName || 'N/A';
  const clientNumber = data.clientNumber || 'N/A';
  const venue = data.venue || 'N/A';
  const updatedBy = data.updatedBy || 'N/A';
  const updateDate = data.updateDate ? data.updateDate.toDate().toLocaleDateString() : 'N/A';

  const message = `Event Booking Updated:\n\n- Event Date: ${eventDate}\n- Event Time: ${eventTime}\n- Event Venue: ${venue}\n- Client: ${clientName}\n  Contact: ${clientNumber}\n- Updated by: ${updatedBy}\n- Update Date: ${updateDate}`;

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
