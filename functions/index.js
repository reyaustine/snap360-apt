const functions = require('firebase-functions');
const {
  sendTelegramNotificationUpcoming,
  sendTelegramNotificationToday,
  sendNewEventNotification,
  sendUpdatedEventNotification,
  sendDeletedEventNotification,
} = require('./telegramNotif');

exports.sendTelegramNotificationUpcoming = sendTelegramNotificationUpcoming;
exports.sendTelegramNotificationToday = sendTelegramNotificationToday;
exports.sendNewEventNotification = sendNewEventNotification;
exports.sendUpdatedEventNotification = sendUpdatedEventNotification;
exports.sendDeletedEventNotification = sendDeletedEventNotification;
