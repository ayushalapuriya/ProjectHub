const crypto = require('crypto');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');

// @desc    Send invitation
// @route   POST /api/invitations
// @access  Private (Admin/Manager)
const sendInvitation = async (req, res) => {
  try {
    const { email, role, department, message, projectId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await Invitation.findOne({ 
      email, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Invitation already sent to this email'
      });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = await Invitation.create({
      email,
      role: role || 'member',
      department,
      invitedBy: req.user._id,
      project: projectId || null, // Include project if specified
      token,
      message
    });

    // Populate the invitedBy field
    await invitation.populate('invitedBy', 'name email');

    // Send email invitation
    try {
      const emailResult = await emailService.sendInvitationEmail(invitation);
      console.log(`Invitation email sent to ${email}:`, emailResult);
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Don't fail the invitation creation if email fails
    }

    res.status(201).json({
      success: true,
      data: invitation,
      invitationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${token}`
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all invitations
// @route   GET /api/invitations
// @access  Private (Admin/Manager)
const getInvitations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    let query = {};
    if (status) query.status = status;

    // Only admins can see all invitations, managers see only their own
    if (req.user.role !== 'admin') {
      query.invitedBy = req.user._id;
    }

    // Execute query with pagination
    const invitations = await Invitation.find(query)
      .populate('invitedBy', 'name email')
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invitation.countDocuments(query);

    res.json({
      success: true,
      count: invitations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: invitations
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get invitation by token
// @route   GET /api/invitations/token/:token
// @access  Public
const getInvitationByToken = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ 
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    res.json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('Get invitation by token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Accept invitation
// @route   POST /api/invitations/accept/:token
// @access  Public
const acceptInvitation = async (req, res) => {
  try {
    const { name, password } = req.body;
    const { token } = req.params;

    // Find invitation
    const invitation = await Invitation.findOne({ 
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: invitation.email,
      password,
      role: invitation.role,
      department: invitation.department
    });

    // Update invitation
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = user._id;
    await invitation.save();

    // If this is a project-specific invitation, add user to project team
    if (invitation.project) {
      const Project = require('../models/Project');
      await Project.findByIdAndUpdate(
        invitation.project,
        {
          $addToSet: {
            team: {
              user: user._id,
              role: 'member'
            }
          }
        }
      );
    }

    // Create notification for the inviter
    await Notification.createNotification({
      title: 'Invitation Accepted',
      message: `${name} has accepted your invitation and joined the team`,
      type: 'team_added',
      user: invitation.invitedBy,
      relatedId: user._id,
      relatedType: 'user',
      priority: 'medium'
    });

    // Generate JWT token for the new user
    const jwt = require('jsonwebtoken');
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      },
      token: jwtToken
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Decline invitation
// @route   POST /api/invitations/decline/:token
// @access  Public
const declineInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ 
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    invitation.status = 'declined';
    await invitation.save();

    res.json({
      success: true,
      message: 'Invitation declined'
    });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel invitation
// @route   DELETE /api/invitations/:id
// @access  Private (Admin/Manager)
const cancelInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && invitation.invitedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this invitation'
      });
    }

    invitation.status = 'expired';
    await invitation.save();

    res.json({
      success: true,
      message: 'Invitation cancelled'
    });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Resend invitation
// @route   POST /api/invitations/:id/resend
// @access  Private (Admin/Manager)
const resendInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && invitation.invitedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resend this invitation'
      });
    }

    // Generate new token and extend expiry
    invitation.token = crypto.randomBytes(32).toString('hex');
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    invitation.status = 'pending';
    await invitation.save();

    // Send email invitation
    try {
      const emailResult = await emailService.sendInvitationEmail(invitation);
      console.log(`Invitation email resent to ${invitation.email}:`, emailResult);
    } catch (error) {
      console.error('Failed to resend invitation email:', error);
      // Don't fail the resend if email fails
    }

    res.json({
      success: true,
      data: invitation,
      invitationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${invitation.token}`
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendInvitation,
  getInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  resendInvitation
};
