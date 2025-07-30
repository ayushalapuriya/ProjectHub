const express = require("express")
const { body, validationResult } = require("express-validator")
const Task = require("../models/Task")
const Project = require("../models/Project")
const { auth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, project, assignedTo } = req.query

    const query = {}

    // Filter by user role and permissions
    if (req.user.role === "developer" || req.user.role === "designer") {
      const userProjects = await Project.find({
        $or: [{ manager: req.user._id }, { "teamMembers.user": req.user._id }],
      }).select("_id")

      const projectIds = userProjects.map((p) => p._id)
      query.project = { $in: projectIds }
    }

    if (status) query.status = status
    if (priority) query.priority = priority
    if (project) query.project = project
    if (assignedTo) query.assignedTo = assignedTo

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await Task.countDocuments(query)

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name manager teamMembers")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("comments.user", "name email")
      .populate("dependencies", "title status")

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Check if user has access to this task
    const hasAccess =
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      task.project.manager.toString() === req.user._id.toString() ||
      task.project.teamMembers.some((member) => member.user.toString() === req.user._id.toString()) ||
      task.assignedTo?._id.toString() === req.user._id.toString() ||
      task.createdBy._id.toString() === req.user._id.toString()

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    res.json({
      success: true,
      data: { task },
    })
  } catch (error) {
    console.error("Get task error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post(
  "/",
  auth,
  [
    body("title").trim().isLength({ min: 2 }).withMessage("Task title must be at least 2 characters"),
    body("project").isMongoId().withMessage("Valid project ID is required"),
    body("dueDate").optional().isISO8601().withMessage("Due date must be a valid date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { title, description, project, assignedTo, priority, startDate, dueDate, estimatedHours } = req.body

      // Check if project exists and user has access
      const projectDoc = await Project.findById(project)
      if (!projectDoc) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        })
      }

      const hasAccess =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        projectDoc.manager.toString() === req.user._id.toString() ||
        projectDoc.teamMembers.some((member) => member.user.toString() === req.user._id.toString())

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this project",
        })
      }

      const task = new Task({
        title,
        description,
        project,
        assignedTo,
        createdBy: req.user._id,
        priority: priority || "medium",
        startDate,
        dueDate,
        estimatedHours,
      })

      await task.save()
      await task.populate("project", "name")
      await task.populate("assignedTo", "name email")
      await task.populate("createdBy", "name email")

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: { task },
      })
    } catch (error) {
      console.error("Create task error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project")

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Check permissions
    const canUpdate =
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      task.project.manager.toString() === req.user._id.toString() ||
      task.assignedTo?.toString() === req.user._id.toString() ||
      task.createdBy.toString() === req.user._id.toString()

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      startDate,
      dueDate,
      estimatedHours,
      actualHours,
      progress,
    } = req.body

    const updateFields = {}
    if (title) updateFields.title = title
    if (description !== undefined) updateFields.description = description
    if (status) {
      updateFields.status = status
      if (status === "completed") {
        updateFields.completedAt = new Date()
        updateFields.progress = 100
      }
    }
    if (priority) updateFields.priority = priority
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo
    if (startDate) updateFields.startDate = startDate
    if (dueDate) updateFields.dueDate = dueDate
    if (estimatedHours !== undefined) updateFields.estimatedHours = estimatedHours
    if (actualHours !== undefined) updateFields.actualHours = actualHours
    if (progress !== undefined) updateFields.progress = progress

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true })
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    res.json({
      success: true,
      message: "Task updated successfully",
      data: { task: updatedTask },
    })
  } catch (error) {
    console.error("Update task error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post(
  "/:id/comments",
  auth,
  [body("text").trim().isLength({ min: 1 }).withMessage("Comment text is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const task = await Task.findById(req.params.id).populate("project")

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        })
      }

      // Check if user has access to this task
      const hasAccess =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        task.project.manager.toString() === req.user._id.toString() ||
        task.project.teamMembers.some((member) => member.user.toString() === req.user._id.toString()) ||
        task.assignedTo?.toString() === req.user._id.toString()

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        })
      }

      const { text } = req.body

      task.comments.push({
        user: req.user._id,
        text,
        createdAt: new Date(),
      })

      await task.save()
      await task.populate("comments.user", "name email")

      res.json({
        success: true,
        message: "Comment added successfully",
        data: {
          comment: task.comments[task.comments.length - 1],
        },
      })
    } catch (error) {
      console.error("Add comment error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project")

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    // Check permissions
    const canDelete =
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      task.project.manager.toString() === req.user._id.toString() ||
      task.createdBy.toString() === req.user._id.toString()

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    await Task.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Delete task error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
