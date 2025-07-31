const express = require('express');
const { body } = require('express-validator');
const {
  sendInvitation,
  getInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  resendInvitation
} = require('../controllers/invitationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const invitationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'member'])
    .withMessage('Role must be admin, manager, or member'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot be more than 500 characters')
];

const acceptInvitationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Routes
router.route('/')
  .get(protect, authorize('admin', 'manager'), getInvitations)
  .post(protect, authorize('admin', 'manager'), invitationValidation, sendInvitation);

router.route('/token/:token')
  .get(getInvitationByToken);

router.route('/accept/:token')
  .post(acceptInvitationValidation, acceptInvitation);

router.route('/decline/:token')
  .post(declineInvitation);

router.route('/:id')
  .delete(protect, authorize('admin', 'manager'), cancelInvitation);

router.route('/:id/resend')
  .post(protect, authorize('admin', 'manager'), resendInvitation);

module.exports = router;
