const express = require("express")
const { body, validationResult } = require("express-validator")
const Project = require("../models/Project")
const Task = require("../models/Task")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query

    const query = {}

    // Filter by user role
    if (req.user.role === "developer" || req.user.role === "designer") {
      query.$or = [{ manager: req.user._id }, { "teamMembers.user": req.user._id }]
    }

    if (status) query.status = status
    if (priority) query.priority = priority
    if (search) {
      query.$and = query.$and || []
      query.$and.push({
        $or: [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }],
      })
    }

    const projects = await Project.find(query)
      .populate("manager", "name email role")
      .populate("teamMembers.user", "name email role")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await Project.countDocuments(query)

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("manager", "name email role avatar")
      .populate("teamMembers.user", "name email role avatar")

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    // Check if user has access to this project
    const hasAccess =
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      project.manager._id.toString() === req.user._id.toString() ||
      project.teamMembers.some((member) => member.user._id.toString() === req.user._id.toString())

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Get project tasks
    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: {
        project,
        tasks,
      },
    })
  } catch (error) {
    console.error("Get project error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin/Manager)
router.post(
  "/",
  auth,
  authorize("admin", "manager", "developer"),
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Project name must be at least 2 characters"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("startDate").isISO8601().withMessage("Start date must be a valid date"),
    body("endDate").isISO8601().withMessage("End date must be a valid date"),
    body("budget").optional().isNumeric().withMessage("Budget must be a number"),
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

      const { name, description, startDate, endDate, budget, priority, teamMembers, tags } = req.body

      // Validate dates
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        })
      }

      const project = new Project({
        name,
        description,
        startDate,
        endDate,
        budget: budget || 0,
        priority: priority || "medium",
        manager: req.user._id,
        teamMembers: teamMembers || [],
        tags: tags || [],
      })

      await project.save()
      await project.populate("manager", "name email role")

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: { project },
      })
    } catch (error) {
      console.error("Create project error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin/Manager/Project Manager)
router.put("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    // Check permissions
    const canUpdate =
      req.user.role === "admin" || req.user.role === "manager" || project.manager.toString() === req.user._id.toString()

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    const { name, description, status, priority, startDate, endDate, budget, spent, progress, teamMembers, tags } =
      req.body

    const updateFields = {}
    if (name) updateFields.name = name
    if (description) updateFields.description = description
    if (status) updateFields.status = status
    if (priority) updateFields.priority = priority
    if (startDate) updateFields.startDate = startDate
    if (endDate) updateFields.endDate = endDate
    if (budget !== undefined) updateFields.budget = budget
    if (spent !== undefined) updateFields.spent = spent
    if (progress !== undefined) updateFields.progress = progress
    if (teamMembers) updateFields.teamMembers = teamMembers
    if (tags) updateFields.tags = tags

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate("manager", "name email role")
      .populate("teamMembers.user", "name email role")

    res.json({
      success: true,
      message: "Project updated successfully",
      data: { project: updatedProject },
    })
  } catch (error) {
    console.error("Update project error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin/Manager)
router.delete("/:id", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id })

    // Delete the project
    await Project.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Project deleted successfully",
    })
  } catch (error) {
    console.error("Delete project error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Import nodemailer for sending emails
const nodemailer = require("nodemailer")
const User = require("../models/User")

// Helper function to send invitation email
async function sendInvitationEmail(email, project, inviteToken) {
  // Configure your SMTP transporter here
  const transporter = nodemailer.createTransport({
    // Example using Gmail SMTP
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const acceptUrl = `${process.env.CLIENT_URL}/projects/${project._id}/accept-invitation?token=${inviteToken}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Invitation to join project: ${project.name}`,
    html: `
      <p>You have been invited to join the project <strong>${project.name}</strong>.</p>
      <p>Click <a href="${acceptUrl}">here</a> to accept the invitation.</p>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// POST /api/projects/:id/invite - Invite user by email
router.post("/:id/invite", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    // Check permissions: admin, manager, or project manager
    const canInvite =
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      project.manager.toString() === req.user._id.toString()

    if (!canInvite) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    const { email } = req.body
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      })
    }

    // Check if email is already a team member
    const user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      const isTeamMember = project.teamMembers.some(
        (member) => member.user.toString() === user._id.toString(),
      )
      if (isTeamMember) {
        return res.status(400).json({
          success: false,
          message: "User is already a team member",
        })
      }
    }

    // Check if email is already invited
    const isInvited = project.invitedMembers.some(
      (invited) => invited.email.toLowerCase() === email.toLowerCase() && invited.status === "pending",
    )
    if (isInvited) {
      return res.status(400).json({
        success: false,
        message: "User is already invited",
      })
    }

    // Add to invitedMembers
    project.invitedMembers.push({ email: email.toLowerCase(), status: "pending" })
    await project.save()

    // Generate invite token (for simplicity, use project ID and email base64 encoded)
    const inviteToken = Buffer.from(`${project._id}:${email}`).toString("base64")

    // Send invitation email
    await sendInvitationEmail(email, project, inviteToken)

    res.json({
      success: true,
      message: "Invitation sent successfully",
    })
  } catch (error) {
    console.error("Invite user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// POST /api/projects/:id/accept-invitation - Accept invitation
router.post("/:id/accept-invitation", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    const userEmail = req.user.email.toLowerCase()

    // Check if user is invited and status is pending
    const invitedIndex = project.invitedMembers.findIndex(
      (invited) => invited.email.toLowerCase() === userEmail && invited.status === "pending",
    )
    if (invitedIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "No pending invitation found for this user",
      })
    }

    // Update invitation status to accepted
    project.invitedMembers[invitedIndex].status = "accepted"

    // Add user to teamMembers if not already present
    const isTeamMember = project.teamMembers.some(
      (member) => member.user.toString() === req.user._id.toString(),
    )
    if (!isTeamMember) {
      project.teamMembers.push({ user: req.user._id, role: "member", joinedAt: new Date() })
    }

    await project.save()

    res.json({
      success: true,
      message: "Invitation accepted and added to team members",
      data: { project },
    })
  } catch (error) {
    console.error("Accept invitation error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
