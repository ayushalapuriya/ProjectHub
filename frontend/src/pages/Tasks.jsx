import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaTasks,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUser,
  FaProjectDiagram,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { useApi } from '../hooks/useApi';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatRelativeTime, isOverdue, isDueToday } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import CreateTaskModal from '../components/tasks/CreateTaskModal';

const Tasks = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Parse URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const project = searchParams.get('project');
    const assignee = searchParams.get('assignee');
    const search = searchParams.get('search');

    if (status) {
      // Handle special status filters
      if (status === 'overdue') {
        // For overdue tasks, we'll filter on the frontend since backend doesn't have overdue status
        setStatusFilter('');
      } else {
        setStatusFilter(status);
      }
    }
    if (priority) setPriorityFilter(priority);
    if (project) setProjectFilter(project);
    if (assignee) setAssigneeFilter(assignee);
    if (search) setSearchQuery(search);
  }, [location.search]);

  const { data: tasksData, loading, error, refetch } = useApi(
    () => taskService.getTasks({
      search: searchQuery,
      status: statusFilter,
      priority: priorityFilter,
      project: projectFilter,
      assignee: assigneeFilter
    }),
    [searchQuery, statusFilter, priorityFilter, projectFilter, assigneeFilter]
  );

  // Apply frontend filtering for special cases
  const filteredTasks = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlStatus = searchParams.get('status');
    let tasks = tasksData?.data || [];

    if (urlStatus === 'overdue') {
      // Filter for overdue tasks
      tasks = tasks.filter(task =>
        task.dueDate &&
        isOverdue(task.dueDate) &&
        task.status !== 'completed'
      );
    } else if (urlStatus === 'completed') {
      // Filter for tasks completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      tasks = tasks.filter(task => {
        if (task.status !== 'completed') return false;

        const completedDate = new Date(task.updatedAt);
        return completedDate >= today && completedDate < tomorrow;
      });
    } else if (urlStatus === 'review') {
      // Filter for tasks in review status
      tasks = tasks.filter(task => task.status === 'review');
    }

    return tasks;
  }, [tasksData, location.search]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'secondary';
      case 'in-progress': return 'primary';
      case 'review': return 'warning';
      case 'completed': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 25) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-danger-600">Error loading tasks: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const tasks = filteredTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Tasks</h1>
          <p className="mt-1 text-sm text-secondary-600">
            {user?.role === 'admin'
              ? 'Manage all tasks across projects'
              : user?.role === 'manager'
              ? 'Manage and assign tasks to your team'
              : 'View and update your assigned tasks'
            }
          </p>
          {(() => {
            const searchParams = new URLSearchParams(location.search);
            const urlStatus = searchParams.get('status');
            if (urlStatus === 'overdue') {
              return (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-danger-100 text-danger-800">
                  <FaExclamationTriangle className="mr-1 h-3 w-3" />
                  Showing Overdue Tasks
                </div>
              );
            } else if (urlStatus === 'completed') {
              return (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-success-100 text-success-800">
                  <FaCheckCircle className="mr-1 h-3 w-3" />
                  Showing Completed Tasks
                </div>
              );
            } else if (urlStatus === 'review') {
              return (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-warning-100 text-warning-800">
                  <FaExclamationTriangle className="mr-1 h-3 w-3" />
                  Showing Tasks Under Review
                </div>
              );
            }
            return null;
          })()}
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {(() => {
            const searchParams = new URLSearchParams(location.search);
            const hasUrlFilters = searchParams.get('status') || searchParams.get('priority') ||
            searchParams.get('project') || searchParams.get('assignee');
            if (hasUrlFilters) {
              return (
                <Link to="/tasks">
                  <Button variant="outline">
                    Clear Filter
                  </Button>
                </Link>
              );
            }
            return null;
          })()}
          <Button
            icon={<FaPlus />}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary-600 to-primary-700"
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Assignees</option>
            <option value={user?._id}>My Tasks</option>
          </select>

          <div className="flex items-center text-sm text-secondary-600">
            <FaFilter className="mr-2" />
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-secondary-200">
          <FaTasks className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No tasks found</h3>
          <p className="text-secondary-600 mb-4">
            {searchQuery || statusFilter || priorityFilter || assigneeFilter
              ? 'Try adjusting your filters to see more tasks.'
              : 'Get started by creating your first task.'
            }
          </p>
          <Button
            icon={<FaPlus />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Task
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.filter(task => task && task._id).map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="text-lg font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                        >
                          {task.title}
                        </Link>
                        {task.description && (
                          <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-1 text-secondary-400 hover:text-primary-600 transition-colors">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-secondary-400 hover:text-danger-600 transition-colors">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Status and Priority */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority} priority
                      </Badge>
                      {isOverdue(task.dueDate) && task.status !== 'completed' && (
                        <Badge variant="danger">
                          <FaExclamationTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                      {isDueToday(task.dueDate) && task.status !== 'completed' && (
                        <Badge variant="warning">
                          <FaClock className="h-3 w-3 mr-1" />
                          Due Today
                        </Badge>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-secondary-600">Progress</span>
                        <span className="font-medium text-secondary-900">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 bg-${getProgressColor(task.progress)}-500`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Task Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      {/* Project */}
                      <div className="flex items-center">
                        <FaProjectDiagram className="h-4 w-4 text-secondary-400 mr-2" />
                        <span className="text-secondary-600">
                          {task.project?.name || 'No project'}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center">
                        <FaUser className="h-4 w-4 text-secondary-400 mr-2" />
                        <div className="flex items-center">
                          {task.assignee ? (
                            <>
                              <Avatar
                                src={task.assignee.avatar}
                                name={task.assignee.name}
                                size="xs"
                                className="mr-2"
                              />
                              <span className="text-secondary-600">{task.assignee.name}</span>
                            </>
                          ) : (
                            <span className="text-secondary-400">Unassigned</span>
                          )}
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center">
                        <FaClock className={`h-4 w-4 mr-2 ${
                          isOverdue(task.dueDate) ? 'text-danger-500' :
                          isDueToday(task.dueDate) ? 'text-warning-500' :
                          'text-secondary-400'
                        }`} />
                        <span className={`text-sm ${
                          isOverdue(task.dueDate) ? 'text-danger-600' :
                          isDueToday(task.dueDate) ? 'text-warning-600' :
                          'text-secondary-600'
                        }`}>
                          Due {formatDate(task.dueDate)}
                        </span>
                      </div>

                      {/* Created */}
                      <div className="flex items-center">
                        <span className="text-secondary-600">
                          Created {formatRelativeTime(task.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />
    </div>
  );
};

export default Tasks;
