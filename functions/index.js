const functions = require('firebase-functions');
const {
  sendTelegramNotificationUpcoming,
  sendTelegramNotificationToday,
  sendNewEventNotification,
  sendUpdatedEventNotification,
  sendDeletedEventNotification,
  botWebhook,
} = require('./telegramNotif');

// Export the main functions
exports.sendTelegramNotificationUpcoming = sendTelegramNotificationUpcoming;
exports.sendTelegramNotificationToday = sendTelegramNotificationToday;
exports.sendNewEventNotification = sendNewEventNotification;
exports.sendUpdatedEventNotification = sendUpdatedEventNotification;
exports.sendDeletedEventNotification = sendDeletedEventNotification;
exports.botWebhook = botWebhook;

// You don't need to export the following functions individually as they are handled within botWebhook:
// handleMessage, sendUpcomingEventsList, sendTodayEventsList, sendEventsWeekList

// Log that the functions have been initialized
console.log('Telegram bot functions initialized');