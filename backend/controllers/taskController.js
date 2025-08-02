const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { search, status, priority, project, assignee, page = 1, limit = 20 } = req.query;

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;
    if (assignee) query.assignee = assignee;

    // Execute query with pagination
    const tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      count: tasks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      isActive: { $ne: false }
    })
      .populate('project', 'name status manager')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('dependencies', 'title status');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignee,
      priority,
      startDate,
      dueDate,
      dependencies,
      timeTracking,
      tags
    } = req.body;

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      reporter: req.user._id,
      priority: priority || 'medium',
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      dependencies: dependencies || [],
      timeTracking: timeTracking || {},
      tags: tags || []
    });

    // Populate the created task
    await task.populate('project', 'name status');
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    // Create notification for assignee
    if (assignee && assignee !== req.user._id.toString()) {
      await Notification.createNotification({
        title: 'Task Assigned',
        message: `You have been assigned to task "${task.title}"`,
        type: 'task_assigned',
        user: assignee,
        relatedId: task._id,
        relatedType: 'task',
        priority: 'medium'
      });
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      isActive: { $ne: false }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignee;

    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'name status')
     .populate('assignee', 'name email avatar')
     .populate('reporter', 'name email avatar');

    // Create notifications for status changes
    if (oldStatus !== task.status) {
      await Notification.createNotification({
        title: 'Task Updated',
        message: `Task "${task.title}" status changed from ${oldStatus} to ${task.status}`,
        type: 'task_updated',
        user: task.assignee || task.reporter,
        relatedId: task._id,
        relatedType: 'task',
        priority: 'low'
      });
    }

    // Create notification for assignee change
    if (oldAssignee?.toString() !== task.assignee?.toString() && task.assignee) {
      await Notification.createNotification({
        title: 'Task Assigned',
        message: `You have been assigned to task "${task.title}"`,
        type: 'task_assigned',
        user: task.assignee,
        relatedId: task._id,
        relatedType: 'task',
        priority: 'medium'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      isActive: { $ne: false }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Soft delete - mark as inactive
    task.isActive = false;
    await task.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findOne({
      _id: req.params.id,
      isActive: { $ne: false }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = {
      text,
      author: req.user._id,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();

    // Populate the comment author
    await task.populate('comments.author', 'name email avatar');
    const newComment = task.comments[task.comments.length - 1];

    // Create notification for task assignee (if not the commenter)
    if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        title: 'Comment Added',
        message: `${req.user.name} commented on task "${task.title}"`,
        type: 'comment_added',
        user: task.assignee,
        relatedId: task._id,
        relatedType: 'task',
        priority: 'low'
      });
    }

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment
};
