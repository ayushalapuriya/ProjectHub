const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const router = express.Router();

// Validation middleware for creating projects
const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Please provide a valid start date');
      }
      return true;
    }),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Please provide a valid end date');
      }
      return true;
    })
];

// Validation middleware for updating projects (more flexible)
const projectUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters'),
  body('startDate')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Please provide a valid start date');
        }
      }
      return true;
    }),
  body('endDate')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Please provide a valid end date');
        }
      }
      return true;
    }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Status must be planning, active, on-hold, completed, or cancelled')
];

// Routes
router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin', 'manager'), projectValidation, handleValidationErrors, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('admin', 'manager'), projectUpdateValidation, handleValidationErrors, updateProject)
  .delete(protect, authorize('admin', 'manager'), deleteProject);

module.exports = router;
