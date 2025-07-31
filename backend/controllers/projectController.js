const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { search, status, priority, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;



    // Execute query with pagination
    const projects = await Project.find(query)
      .populate('manager', 'name email avatar')
      .populate('team.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);



    // Calculate progress for each project
    for (let project of projects) {
      const calculatedProgress = await project.calculateProgress();
      if (calculatedProgress !== project.progress) {
        project.progress = calculatedProgress;
        await project.save();
      }
    }

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      count: projects.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email avatar')
      .populate('team.user', 'name email avatar role department');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get project tasks
    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ createdAt: -1 });

    // Calculate and update progress
    const calculatedProgress = await project.calculateProgress();
    if (calculatedProgress !== project.progress) {
      project.progress = calculatedProgress;
      await project.save();
    }

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        tasks
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Manager/Admin)
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      priority,
      budget,
      manager,
      team,
      resources,
      tags
    } = req.body;

    // Create project
    const project = await Project.create({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority: priority || 'medium',
      manager: manager || req.user._id,
      team: team || [],
      budget: budget || 0,
      resources: resources || [],
      tags: tags || []
    });

    // Populate the created project
    await project.populate('manager', 'name email avatar');
    await project.populate('team.user', 'name email avatar');

    // Create notifications for team members
    if (team && team.length > 0) {
      const teamUserIds = team.map(member => member.user);
      for (const userId of teamUserIds) {
        if (userId !== req.user._id.toString()) {
          await Notification.createNotification({
            title: 'Added to Project',
            message: `You have been added to project "${project.name}"`,
            type: 'team_added',
            user: userId,
            relatedId: project._id,
            relatedType: 'project',
            priority: 'medium'
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Manager/Admin)
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is manager or admin
    if (project.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Update project
    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'name email avatar')
     .populate('team.user', 'name email avatar');

    // Create notification for project update
    await Notification.createNotification({
      title: 'Project Updated',
      message: `Project "${project.name}" has been updated`,
      type: 'project_updated',
      user: project.manager,
      relatedId: project._id,
      relatedType: 'project',
      priority: 'low'
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Manager/Admin)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is manager or admin
    if (project.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Soft delete - mark as inactive
    project.isActive = false;
    await project.save();

    // Also mark related tasks as inactive
    await Task.updateMany(
      { project: project._id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};
