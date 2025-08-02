const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search, role, department, isActive } = req.query;
    let query = {};

    // Build query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, skills, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (skills) user.skills = skills;
    if (isActive !== undefined) user.isActive = isActive;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        skills: updatedUser.skills,
        isActive: updatedUser.isActive,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const Project = require('../models/Project');
    const Task = require('../models/Task');

    // Get projects based on user role
    let projectQuery = { isActive: { $ne: false } }; // Only get active projects

    if (req.user.role === 'admin') {
      // Admins can see all active projects
      projectQuery = { isActive: { $ne: false } };
    } else {
      // Managers and members see only their assigned active projects
      projectQuery = {
        isActive: { $ne: false },
        $or: [
          { manager: userId },
          { 'team.user': userId }
        ]
      };
    }

    const projects = await Project.find(projectQuery)
      .populate('manager', 'name email avatar')
      .populate('team.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get tasks based on user role
    let taskQuery = {};

    if (req.user.role === 'admin') {
      // Admins can see all tasks
      taskQuery = {};
    } else {
      // Managers and members see only their assigned tasks
      taskQuery = {
        $or: [
          { assignee: userId },
          { reporter: userId }
        ]
      };
    }

    const tasks = await Task.find(taskQuery)
      .populate({
        path: 'project',
        select: 'name status',
        match: { isActive: { $ne: false } }
      })
      .populate('assignee', 'name email avatar')
      .sort({ dueDate: 1 })
      .limit(10);

    // Filter out tasks from deleted projects
    const filteredTasks = tasks.filter(task => task.project);

    // Calculate task statistics - only include tasks from active projects
    const allUserTasks = await Task.find(taskQuery)
      .populate({
        path: 'project',
        select: 'name status',
        match: { isActive: { $ne: false } }
      });

    const activeProjectTasks = allUserTasks.filter(task => task.project);

    // Calculate date range for "today"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const taskStats = {
      total: activeProjectTasks.length,
      todo: activeProjectTasks.filter(t => t.status === 'todo').length,
      inProgress: activeProjectTasks.filter(t => t.status === 'in-progress').length,
      review: activeProjectTasks.filter(t => t.status === 'review').length,
      completed: activeProjectTasks.filter(t => {
        if (t.status !== 'completed') return false;
        const completedDate = new Date(t.updatedAt);
        return completedDate >= today && completedDate < tomorrow;
      }).length,
      overdue: activeProjectTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length
    };

    // Calculate project statistics (using the same query that excludes inactive projects)
    const allUserProjects = await Project.find(projectQuery);

    const projectStats = {
      total: allUserProjects.length,
      planning: allUserProjects.filter(p => p.status === 'planning').length,
      active: allUserProjects.filter(p => p.status === 'active').length,
      onHold: allUserProjects.filter(p => p.status === 'on-hold').length,
      completed: allUserProjects.filter(p => p.status === 'completed').length
    };

    // Get upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingDeadlines = await Task.find({
      ...taskQuery,
      dueDate: { $gte: new Date(), $lte: nextWeek },
      status: { $ne: 'completed' }
    })
    .populate({
      path: 'project',
      select: 'name',
      match: { isActive: { $ne: false } }
    })
    .sort({ dueDate: 1 })
    .limit(5);

    // Filter out deadlines from deleted projects
    const filteredUpcomingDeadlines = upcomingDeadlines.filter(task => task.project);

    res.json({
      success: true,
      data: {
        projects,
        tasks: filteredTasks,
        taskStats,
        projectStats,
        upcomingDeadlines: filteredUpcomingDeadlines
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDashboard
};
