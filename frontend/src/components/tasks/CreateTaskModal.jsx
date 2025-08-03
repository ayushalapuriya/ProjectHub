import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaPlus, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { useApi, useAsyncOperation } from '../../hooks/useApi';
import Button from '../common/Button';
import Modal from '../common/Modal';

const CreateTaskModal = ({ isOpen, onClose, projectId, project, onSuccess }) => {
  const { execute, loading } = useAsyncOperation();
  const { data: usersData } = useApi(() => userService.getUsers(), []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    assignee: '',
    timeTracking: {
      estimated: ''
    },
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const allUsers = usersData?.data || [];

  // Filter users to show only project team members and manager
  const users = project ? [
    project.manager,
    ...(project.team?.map(member => member.user) || [])
  ].filter((user, index, self) =>
    user && user._id && self.findIndex(u => u && u._id === user._id) === index // Remove duplicates and null values
  ) : allUsers;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'estimated') {
      setFormData(prev => ({
        ...prev,
        timeTracking: {
          ...prev.timeTracking,
          estimated: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (formData.startDate && formData.dueDate && new Date(formData.startDate) >= new Date(formData.dueDate)) {
      newErrors.dueDate = 'Due date must be after start date';
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
      const taskData = {
        ...formData,
        project: projectId,
        timeTracking: {
          estimated: formData.timeTracking.estimated ? parseInt(formData.timeTracking.estimated) : 0,
          logged: 0,
          remaining: formData.timeTracking.estimated ? parseInt(formData.timeTracking.estimated) : 0
        },
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      await execute(() => taskService.createTask(taskData));
      
      toast.success('Task created successfully!');
      onSuccess?.();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        assignee: '',
        timeTracking: {
          estimated: ''
        },
        tags: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      startDate: '',
      dueDate: '',
      assignee: '',
      timeTracking: {
        estimated: ''
      },
      tags: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">Create New Task</h2>
          <button
            onClick={handleClose}
            className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.title ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                }`}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-danger-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Describe the task"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Assignee
                </label>
                <div className="relative">
                  <select
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select assignee</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Due Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.dueDate ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                    }`}
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4 pointer-events-none" />
                </div>
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-danger-600">{errors.dueDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimated"
                  value={formData.timeTracking.estimated}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
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
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="frontend, urgent, bug (comma separated)"
                />
              </div>
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
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
