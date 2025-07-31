import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaPlus, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useApi, useAsyncOperation } from '../../hooks/useApi';
import Button from '../common/Button';
import Modal from '../common/Modal';

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
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
    resources: []
  });

  const [errors, setErrors] = useState({});
  const users = usersData?.data || [];

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

  const handleTeamChange = (userId, role) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.some(member => member.user === userId)
        ? prev.team.filter(member => member.user !== userId)
        : [...prev.team, { user: userId, role: role || 'member' }]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
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
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      await execute(() => projectService.createProject(projectData));
      
      toast.success('Project created successfully!');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        budget: '',
        team: [],
        tags: '',
        resources: []
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      priority: 'medium',
      budget: '',
      team: [],
      tags: '',
      resources: []
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">Create New Project</h2>
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
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.description ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                }`}
                placeholder="Describe your project"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.startDate ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                  }`}
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4 pointer-events-none" />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-danger-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.endDate ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                  }`}
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4 pointer-events-none" />
              </div>
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
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Budget
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="web, mobile, api (comma separated)"
              />
            </div>
          </div>

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              Team Members
            </label>
            <div className="max-h-40 overflow-y-auto border border-secondary-300 rounded-lg p-3">
              {users.map((user) => (
                <label key={user._id} className="flex items-center space-x-3 py-2 hover:bg-secondary-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.team.some(member => member.user === user._id)}
                    onChange={() => handleTeamChange(user._id, 'member')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                      <p className="text-xs text-secondary-500">{user.email}</p>
                    </div>
                  </div>
                </label>
              ))}
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
              icon={<FaPlus />}
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateProjectModal;
