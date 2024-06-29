const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

const db = admin.firestore();

const botToken = '7026079422:AAGFCWOnD2WcVNQSiWI_ej3p7bufEeiKY04';
const chatIds = ['1323179695','1912529798']; // Austine // Marion 

exports.sendTelegramNotification = functions.pubsub.schedule('every day 00:00').onRun(async (context) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startTimestamp = admin.firestore.Timestamp.fromDate(today);
  const endTimestamp = admin.firestore.Timestamp.fromDate(endOfMonth);

  const snapshot = await db.collection('appointments')
    .where('aptDate', '>=', startTimestamp)
    .get();

  if (snapshot.empty) {
    console.log('No upcoming events found.');
    return;
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

      if (aptDate !== 'N/A' && aptDate >= today) { // Ensure we don't include past dates
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

  if (events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }

  const message = events.map(event => 
    `Event Date: ${event.eventDate}\nTime: ${event.eventTime}\nClient: ${event.clientName}\nContact: ${event.clientNumber}\nService: ${event.service}`
  ).join('\n\n');

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
});
