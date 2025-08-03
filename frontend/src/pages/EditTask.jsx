import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useApi, useAsyncOperation } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { execute, loading } = useAsyncOperation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    startDate: '',
    dueDate: '',
    assignee: '',
    project: '',
    timeTracking: {
      estimated: ''
    },
    tags: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch task data
  const { data: taskData, loading: taskLoading, error: taskError } = useApi(
    () => taskService.getTask(id),
    [id]
  );

  // Fetch projects and users
  const { data: projectsData } = useApi(() => projectService.getProjects(), []);
  const { data: usersData } = useApi(() => userService.getUsers(), []);

  const projects = projectsData?.data || [];
  const users = usersData?.data || [];

  // Populate form when task data is loaded
  useEffect(() => {
    if (taskData?.data) {
      const task = taskData.data;
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignee: task.assignee?._id || '',
        project: task.project?._id || '',
        timeTracking: {
          estimated: task.timeTracking?.estimated || ''
        },
        tags: task.tags ? task.tags.join(', ') : ''
      });
    }
  }, [taskData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
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
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.project) {
      newErrors.project = 'Project is required';
    }
    
    if (!formData.assignee) {
      newErrors.assignee = 'Assignee is required';
    }
    
    if (formData.startDate && formData.dueDate && new Date(formData.startDate) > new Date(formData.dueDate)) {
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
        timeTracking: {
          estimated: formData.timeTracking.estimated ? parseInt(formData.timeTracking.estimated) : 0
        },
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      // Remove empty dates
      if (!taskData.startDate) delete taskData.startDate;
      if (!taskData.dueDate) delete taskData.dueDate;

      await execute(() => taskService.updateTask(id, taskData));
      toast.success('Task updated successfully!');
      navigate(`/tasks/${id}`);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (taskLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (taskError) {
    return (
      <div className="text-center py-12">
        <p className="text-danger-600">Error loading task: {taskError}</p>
        <Button
          onClick={() => navigate('/tasks')}
          className="mt-4"
          variant="outline"
        >
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            icon={<FaArrowLeft />}
            onClick={() => navigate(`/tasks/${id}`)}
          >
            Back to Task
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Edit Task</h1>
            <p className="text-secondary-600">Update task details and settings</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.title ? 'border-danger-300' : 'border-secondary-300'
                }`}
                placeholder="Enter task title"
              />
              {errors.title && <p className="mt-1 text-sm text-danger-600">{errors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.description ? 'border-danger-300' : 'border-secondary-300'
                }`}
                placeholder="Describe the task in detail"
              />
              {errors.description && <p className="mt-1 text-sm text-danger-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Project *
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.project ? 'border-danger-300' : 'border-secondary-300'
                }`}
              >
                <option value="">Select project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project && <p className="mt-1 text-sm text-danger-600">{errors.project}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Assignee *
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.assignee ? 'border-danger-300' : 'border-secondary-300'
                }`}
              >
                <option value="">Select assignee</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.assignee && <p className="mt-1 text-sm text-danger-600">{errors.assignee}</p>}
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
                <option value="urgent">Urgent</option>
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
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
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
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.dueDate ? 'border-danger-300' : 'border-secondary-300'
                }`}
              />
              {errors.dueDate && <p className="mt-1 text-sm text-danger-600">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                name="timeTracking.estimated"
                value={formData.timeTracking.estimated}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="0"
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
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="frontend, urgent, bug (comma separated)"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/tasks/${id}`)}
              icon={<FaTimes />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={<FaSave />}
            >
              Update Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
