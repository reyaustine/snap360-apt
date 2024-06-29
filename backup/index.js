const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const {
  sendTelegramNotificationMorning,
  sendTelegramNotificationEvening,
  sendTelegramNotificationToday
} = require('./telegramNotif');


exports.sendTelegramNotificationMorning = sendTelegramNotificationMorning;
exports.sendTelegramNotificationEvening = sendTelegramNotificationEvening;
exports.sendTelegramNotificationToday = sendTelegramNotificationToday;
