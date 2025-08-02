const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  reviewTask,
  getPendingReviewTasks,
  checkTaskPermissions
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.log('Request body that failed validation:', JSON.stringify(req.body, null, 2));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const router = express.Router();

// Validation middleware
const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Task title must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters'),
  body('project')
    .notEmpty()
    .withMessage('Please provide a project ID'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date')
];

const commentValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

const reviewValidation = [
  body('reviewStatus')
    .isIn(['approved', 'rejected'])
    .withMessage('Review status must be either approved or rejected'),
  body('reviewComments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comments cannot exceed 1000 characters')
];

// Routes
router.route('/')
  .get(protect, getTasks)
  .post(protect, taskValidation, handleValidationErrors, createTask);

router.route('/pending-review')
  .get(protect, getPendingReviewTasks);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/comments')
  .post(protect, commentValidation, handleValidationErrors, addComment);

router.route('/:id/comments/:commentId')
  .delete(protect, deleteComment);

router.route('/:id/review')
  .put(protect, reviewTask); // Temporarily removed validation for testing

router.route('/:id/permissions')
  .get(protect, checkTaskPermissions);

module.exports = router;
