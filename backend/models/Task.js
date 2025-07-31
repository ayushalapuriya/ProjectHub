const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [100, 'Task title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: [true, 'Please assign task to a project']
  },
  assignee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  reporter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  dependencies: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  }],
  comments: [commentSchema],
  attachments: [attachmentSchema],
  timeTracking: {
    estimated: {
      type: Number,
      default: 0
    },
    logged: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Auto-complete when progress is 100%
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
  }
  
  // Update time tracking
  if (this.timeTracking.estimated && this.timeTracking.logged) {
    this.timeTracking.remaining = Math.max(0, this.timeTracking.estimated - this.timeTracking.logged);
  }
  
  next();
});

// Index for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
