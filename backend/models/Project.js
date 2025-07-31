const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['human', 'equipment', 'software', 'other'],
    required: true
  },
  allocated: {
    type: Number,
    default: 0
  },
  available: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'hours'
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
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
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  manager: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a project manager']
  },
  team: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  budget: {
    type: Number,
    default: 0
  },
  resources: [resourceSchema],
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

// Virtual for task count
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Calculate progress based on tasks
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });
  
  if (tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(totalProgress / tasks.length);
};

// Pre-save middleware to update progress
projectSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('status')) {
    if (this.status === 'completed') {
      this.progress = 100;
    }
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
