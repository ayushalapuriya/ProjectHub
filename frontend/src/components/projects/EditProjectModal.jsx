import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaEdit, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useApi, useAsyncOperation } from '../../hooks/useApi';
import Button from '../common/Button';
import Modal from '../common/Modal';

const EditProjectModal = ({ isOpen, onClose, onSuccess, project }) => {
  const { execute, loading } = useAsyncOperation();
  const { data: usersData } = useApi(() => userService.getUsers(), []);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    budget: '',
    team: [],
    tags: '',
    status: 'planning'
  });

  const [errors, setErrors] = useState({});
  const users = usersData?.data || [];

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        priority: project.priority || 'medium',
        budget: project.budget || '',
        team: project.team?.map(member => member.user._id || member.user) || [],
        tags: project.tags?.join(', ') || '',
        status: project.status || 'planning'
      });
    }
  }, [project]);

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

  const handleTeamChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.includes(userId)
        ? prev.team.filter(id => id !== userId)
        : [...prev.team, userId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    // Only validate date order if both dates are provided
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
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
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        // Convert team array of user IDs to array of objects with user and role
        team: formData.team.map(userId => ({
          user: userId,
          role: 'member' // Default role for team members
        }))
      };

      // Remove empty dates to avoid validation errors
      if (!projectData.startDate) {
        delete projectData.startDate;
      }
      if (!projectData.endDate) {
        delete projectData.endDate;
      }

      await execute(() => projectService.updateProject(project._id, projectData));
      
      toast.success('Project updated successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900 flex items-center">
            <FaEdit className="mr-3 text-primary-600" />
            Edit Project
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.name ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.description ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                }`}
                placeholder="Enter project description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.endDate ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-danger-600">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <FaDollarSign className="inline mr-2" />
                Budget
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.budget ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                }`}
                placeholder="0.00"
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-danger-600">{errors.budget}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Team Members
              </label>
              <div className="max-h-40 overflow-y-auto border border-secondary-300 rounded-lg p-3 space-y-2">
                {users.map((user) => {
                  const isSelected = formData.team.includes(user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => handleTeamChange(user._id)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-secondary-200 bg-white hover:border-primary-300 hover:bg-primary-25'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-secondary-300 bg-white'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary-100'
                            : 'bg-secondary-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            isSelected
                              ? 'text-primary-700'
                              : 'text-secondary-600'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isSelected
                              ? 'text-primary-900'
                              : 'text-secondary-900'
                          }`}>
                            {user.name}
                          </p>
                          <p className={`text-xs ${
                            isSelected
                              ? 'text-primary-600'
                              : 'text-secondary-500'
                          }`}>
                            {user.email} - {user.role}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="text-primary-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-secondary-600">
                Click to select/deselect team members
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={<FaEdit />}
            >
              Update Project
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProjectModal;
