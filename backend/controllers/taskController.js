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
      .populate({
        path: 'project',
        select: 'name status manager',
        populate: {
          path: 'manager',
          select: 'name email avatar'
        }
      })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('reviewer', 'name email avatar')
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

    // Access control for progress updates
    if (req.body.progress !== undefined) {
      // Only assignee can update progress
      if (!task.assignee || task.assignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned team member can update task progress'
        });
      }
    }

    // Access control for status changes
    if (req.body.status !== undefined) {
      // Assignee can change status, managers can review
      const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
      const isManager = req.user.role === 'admin' || req.user.role === 'manager';

      if (!isAssignee && !isManager) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to change task status'
        });
      }
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

// @desc    Delete comment from task
// @route   DELETE /api/tasks/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
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

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user can delete comment (author, admin, or project manager)
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Get project to check if user is manager
    const project = await Project.findById(task.project);
    const isManager = project && project.manager.toString() === req.user._id.toString();

    if (!isAuthor && !isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Remove comment
    comment.remove();
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Review task (approve/reject)
// @route   PUT /api/tasks/:id/review
// @access  Private (Manager/Admin)
const reviewTask = async (req, res) => {
  try {
    console.log('Review task request:', req.body, 'User:', req.user.name);
    const { reviewStatus, reviewComments } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      isActive: { $ne: false }
    }).populate('project', 'manager');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is authorized to review (project manager or admin)
    console.log('Access control check:');
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user._id.toString());
    console.log('Project manager:', task.project.manager);

    // Handle both populated and non-populated manager field
    let managerId;
    if (task.project.manager) {
      if (typeof task.project.manager === 'object' && task.project.manager._id) {
        managerId = task.project.manager._id.toString();
      } else {
        managerId = task.project.manager.toString();
      }
    }

    console.log('Manager ID:', managerId);
    console.log('User is admin:', req.user.role === 'admin');
    console.log('User is manager:', managerId === req.user._id.toString());

    if (req.user.role !== 'admin' && managerId !== req.user._id.toString()) {
      console.log('Access denied - user is not admin and not project manager');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this task'
      });
    }

    console.log('Access granted - user can review this task');

    // Check if task is in review status
    if (task.status !== 'review') {
      return res.status(400).json({
        success: false,
        message: 'Task is not in review status'
      });
    }

    // Update review fields
    task.reviewStatus = reviewStatus;
    task.reviewComments = reviewComments;
    task.reviewedAt = new Date();
    task.reviewer = req.user._id;

    // Update task status based on review
    if (reviewStatus === 'approved') {
      task.status = 'completed';
      task.progress = 100;
    } else if (reviewStatus === 'rejected') {
      task.status = 'in-progress'; // Send back to in-progress
    }

    await task.save();

    // Create notification for assignee
    if (task.assignee) {
      await Notification.createNotification({
        title: `Task Review ${reviewStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your task "${task.title}" has been ${reviewStatus} by ${req.user.name}${reviewComments ? ': ' + reviewComments : ''}`,
        type: 'task_reviewed',
        user: task.assignee,
        relatedId: task._id,
        relatedType: 'task',
        priority: reviewStatus === 'approved' ? 'medium' : 'high'
      });
    }

    // Populate the updated task
    await task.populate([
      { path: 'project', select: 'name status manager' },
      { path: 'assignee', select: 'name email avatar' },
      { path: 'reporter', select: 'name email avatar' },
      { path: 'reviewer', select: 'name email avatar' }
    ]);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Review task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get tasks pending review for manager
// @route   GET /api/tasks/pending-review
// @access  Private (Manager/Admin)
const getPendingReviewTasks = async (req, res) => {
  try {
    let query = {
      status: 'review',
      reviewStatus: 'pending',
      isActive: { $ne: false }
    };

    // If user is not admin, only show tasks from their managed projects
    if (req.user.role !== 'admin') {
      const Project = require('../models/Project');
      const managedProjects = await Project.find({ manager: req.user._id }).select('_id');
      const projectIds = managedProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name status manager')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get pending review tasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Check user permissions for task
// @route   GET /api/tasks/:id/permissions
// @access  Private
const checkTaskPermissions = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      isActive: { $ne: false }
    }).populate({
      path: 'project',
      select: 'name status manager',
      populate: {
        path: 'manager',
        select: 'name email avatar'
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    const isReporter = task.reporter && task.reporter.toString() === req.user._id.toString();

    let isManager = false;
    if (task.project.manager) {
      if (typeof task.project.manager === 'object' && task.project.manager._id) {
        isManager = task.project.manager._id.toString() === req.user._id.toString();
      } else {
        isManager = task.project.manager.toString() === req.user._id.toString();
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          role: req.user.role
        },
        task: {
          id: task._id,
          title: task.title,
          status: task.status
        },
        project: {
          id: task.project._id,
          name: task.project.name,
          manager: task.project.manager
        },
        permissions: {
          isAdmin,
          isAssignee,
          isReporter,
          isManager,
          canEdit: isAdmin || isAssignee || isReporter,
          canUpdateProgress: isAdmin || isAssignee,
          canReview: isAdmin || isManager
        }
      }
    });
  } catch (error) {
    console.error('Check permissions error:', error);
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
  addComment,
  deleteComment,
  reviewTask,
  getPendingReviewTasks,
  checkTaskPermissions
};
