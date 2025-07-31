const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'member'],
    default: 'member'
  },
  department: {
    type: String,
    trim: true
  },
  invitedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  acceptedAt: {
    type: Date
  },
  acceptedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for better query performance
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ token: 1 });
invitationSchema.index({ expiresAt: 1 });

// Check if invitation is expired
invitationSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date() || this.status === 'expired';
});

// Pre-save middleware to mark expired invitations
invitationSchema.pre('save', function(next) {
  if (this.expiresAt < new Date() && this.status === 'pending') {
    this.status = 'expired';
  }
  next();
});

// Static method to clean up expired invitations
invitationSchema.statics.cleanupExpired = async function() {
  return this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      status: 'pending'
    },
    { status: 'expired' }
  );
};

module.exports = mongoose.model('Invitation', invitationSchema);
