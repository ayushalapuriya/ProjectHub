import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaUserPlus, FaEnvelope, FaBriefcase } from 'react-icons/fa';
import { invitationService } from '../../services/invitationService';
import { useAsyncOperation } from '../../hooks/useApi';
import Button from '../common/Button';
import Modal from '../common/Modal';

const InviteModal = ({ isOpen, onClose, onSuccess, projectId }) => {
  const { execute, loading } = useAsyncOperation();
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    department: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const invitationData = {
        ...formData,
        projectId: projectId // Include project ID for project-specific invitations
      };
      const result = await execute(() => invitationService.sendInvitation(invitationData));
      
      toast.success(`Invitation sent to ${formData.email}!`);
      
      // Show invitation link for testing (in production, this would be sent via email)
      if (result.invitationLink) {
        toast.info(`Invitation link: ${result.invitationLink}`, {
          autoClose: 10000,
          position: 'top-center'
        });
      }
      
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      role: 'member',
      department: '',
      message: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900 flex items-center">
            <FaUserPlus className="mr-3 text-primary-600" />
            Invite Team Member
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.email ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                }`}
                placeholder="Enter email address"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <p className="mt-1 text-xs text-secondary-500">
              {formData.role === 'admin' && 'Full system access and user management'}
              {formData.role === 'manager' && 'Can create projects and manage teams'}
              {formData.role === 'member' && 'Can work on assigned tasks and projects'}
            </p>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Department
            </label>
            <div className="relative">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select department</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Management">Management</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
              <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add a personal message to the invitation..."
              maxLength={500}
            />
            <p className="mt-1 text-xs text-secondary-500">
              {formData.message.length}/500 characters
            </p>
          </div>

          {/* Preview */}
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <h4 className="text-sm font-medium text-secondary-900 mb-2">Invitation Preview:</h4>
            <div className="text-sm text-secondary-700">
              <p className="mb-2">
                <strong>{formData.email}</strong> will be invited to join as a{' '}
                <span className="font-medium capitalize">{formData.role}</span>
                {formData.department && (
                  <span> in the <span className="font-medium">{formData.department}</span> department</span>
                )}
              </p>
              {formData.message && (
                <div className="mt-2 p-2 bg-white rounded border-l-4 border-primary-500">
                  <p className="text-xs text-secondary-600 mb-1">Personal message:</p>
                  <p className="italic">"{formData.message}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={<FaUserPlus />}
              className="bg-gradient-to-r from-primary-600 to-primary-700"
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default InviteModal;
