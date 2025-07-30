const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin/Manager)
router.get("/", auth, authorize("admin", "manager", "developer"), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, department } = req.query

    const query = { isActive: true }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    if (role) query.role = role
    if (department) query.department = department

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  auth,
  [
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("phone").optional().trim(),
    body("department").optional().trim(),
    body("skills").optional().isArray().withMessage("Skills must be an array"),
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

      const { name, phone, department, skills, avatar } = req.body

      const updateFields = {}
      if (name) updateFields.name = name
      if (phone !== undefined) updateFields.phone = phone
      if (department !== undefined) updateFields.department = department
      if (skills) updateFields.skills = skills
      if (avatar !== undefined) updateFields.avatar = avatar

      const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true, runValidators: true }).select(
        "-password",
      )

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").exists().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
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

      const { currentPassword, newPassword } = req.body

      const user = await User.findById(req.user._id)

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({
        success: true,
        message: "Password changed successfully",
      })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

module.exports = router
