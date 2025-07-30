const express = require("express")
const User = require("../models/User")
const Project = require("../models/Project")
const Task = require("../models/Task")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/resources
// @desc    Get resource utilization data
// @access  Private (Admin/Manager)
router.get("/", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password")

    const resourceData = await Promise.all(
      users.map(async (user) => {
        // Get user's projects
        const projects = await Project.find({
          $or: [{ manager: user._id }, { "teamMembers.user": user._id }],
          status: { $in: ["planning", "in-progress"] },
        }).select("name status")

        // Get user's tasks
        const tasks = await Task.find({
          assignedTo: user._id,
          status: { $in: ["todo", "in-progress", "review"] },
        }).select("title status priority dueDate estimatedHours actualHours")

        // Calculate utilization metrics
        const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
        const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "completed",
          completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        })

        // Calculate utilization percentage (assuming 40 hours per week)
        const weeklyCapacity = 40
        const utilization = Math.min((totalEstimatedHours / weeklyCapacity) * 100, 100)

        return {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            department: user.department,
            skills: user.skills,
          },
          projects: projects.length,
          activeTasks: tasks.length,
          completedTasksLastMonth: completedTasks,
          totalEstimatedHours,
          totalActualHours,
          utilization: Math.round(utilization),
          status: utilization > 90 ? "overloaded" : utilization > 70 ? "busy" : "available",
          currentProjects: projects.map((p) => p.name),
        }
      }),
    )

    res.json({
      success: true,
      data: {
        resources: resourceData,
        summary: {
          totalResources: resourceData.length,
          availableResources: resourceData.filter((r) => r.status === "available").length,
          busyResources: resourceData.filter((r) => r.status === "busy").length,
          overloadedResources: resourceData.filter((r) => r.status === "overloaded").length,
          averageUtilization: Math.round(resourceData.reduce((sum, r) => sum + r.utilization, 0) / resourceData.length),
        },
      },
    })
  } catch (error) {
    console.error("Get resources error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/resources/dashboard
// @desc    Get resource dashboard data
// @access  Private (Admin/Manager)
router.get("/dashboard", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get project statistics
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalBudget: { $sum: "$budget" },
          totalSpent: { $sum: "$spent" },
        },
      },
    ])

    // Get task statistics
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalEstimatedHours: { $sum: "$estimatedHours" },
          totalActualHours: { $sum: "$actualHours" },
        },
      },
    ])

    // Get overdue tasks
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $in: ["todo", "in-progress", "review"] },
    })
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .select("title dueDate priority")

    // Get recent activities
    const recentTasks = await Task.find({
      updatedAt: { $gte: thirtyDaysAgo },
    })
      .populate("assignedTo", "name")
      .populate("project", "name")
      .select("title status updatedAt")
      .sort({ updatedAt: -1 })
      .limit(10)

    // Get team performance
    const teamPerformance = await Task.aggregate([
      {
        $match: {
          assignedTo: { $exists: true },
          completedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          completedTasks: { $sum: 1 },
          totalActualHours: { $sum: "$actualHours" },
          avgProgress: { $avg: "$progress" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          completedTasks: 1,
          totalActualHours: 1,
          avgProgress: { $round: ["$avgProgress", 2] },
        },
      },
      {
        $sort: { completedTasks: -1 },
      },
      {
        $limit: 10,
      },
    ])

    res.json({
      success: true,
      data: {
        projectStats,
        taskStats,
        overdueTasks,
        recentActivities: recentTasks,
        teamPerformance,
      },
    })
  } catch (error) {
    console.error("Get dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
