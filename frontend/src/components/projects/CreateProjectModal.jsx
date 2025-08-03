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
            <div className="max-h-40 overflow-y-auto border border-secondary-300 rounded-lg p-3 space-y-2">
              {users.map((user) => {
                const isSelected = formData.team.some(member => member.user === user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => handleTeamChange(user._id, 'member')}
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
                          {user.email}
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
