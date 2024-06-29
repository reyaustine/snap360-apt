/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Import the telegram notification functions
const { 
  sendTelegramNotificationUpcoming, 
  sendTelegramNotificationToday, 
  sendNewEventNotification, 
  sendUpdatedEventNotification 
} = require('./telegramNotif');

// Export the sendTelegramNotificationUpcoming function
exports.sendTelegramNotificationUpcoming = sendTelegramNotificationUpcoming;

// Export the sendTelegramNotificationToday function
exports.sendTelegramNotificationToday = sendTelegramNotificationToday;

// Export the sendNewEventNotification function
exports.sendNewEventNotification = sendNewEventNotification;

// Export the sendUpdatedEventNotification function
exports.sendUpdatedEventNotification = sendUpdatedEventNotification;
