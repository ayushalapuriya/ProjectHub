const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes
router.route('/')
  .get(protect, getNotifications);

router.route('/stats')
  .get(protect, getNotificationStats);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

router.route('/:id/read')
  .put(protect, markAsRead);

module.exports = router;
