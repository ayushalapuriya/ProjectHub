const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDashboard
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes
router.route('/')
  .get(protect, getUsers);

router.route('/dashboard')
  .get(protect, getDashboard);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
