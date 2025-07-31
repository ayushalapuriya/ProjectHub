import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaProjectDiagram,
  FaComments,
  FaPaperPlane,
  FaPlay,
  FaPause,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useApi, useAsyncOperation } from '../hooks/useApi';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatRelativeTime, isOverdue, isDueToday } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState(0);
  const { execute: executeComment, loading: commentLoading } = useAsyncOperation();
  const { execute: executeUpdate, loading: updateLoading } = useAsyncOperation();

  const { data: taskData, loading, error, refetch } = useApi(
    () => taskService.getTask(id),
    [id]
  );

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

  const handleStatusChange = async (newStatus) => {
    try {
      await executeUpdate(() => taskService.updateTask(id, { status: newStatus }));
      toast.success('Task status updated successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleProgressChange = async (newProgress) => {
    try {
      const updateData = { progress: newProgress };
      if (newProgress === 100) {
        updateData.status = 'completed';
      }
      await executeUpdate(() => taskService.updateTask(id, updateData));
      toast.success('Task progress updated successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to update task progress');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await executeComment(() => taskService.addComment(id, { text: comment }));
      setComment('');
      toast.success('Comment added successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to add comment');
    }
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
        <p className="text-danger-600">Error loading task: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const task = taskData?.data;

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Task not found</p>
        <Link to="/tasks">
          <Button className="mt-4">
            Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || task.assignee?._id === user?._id || task.reporter?._id === user?._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/tasks"
            className="mr-4 p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">{task.title}</h1>
            <p className="text-secondary-600 mt-1">{task.description}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              icon={<FaEdit />}
            >
              Edit Task
            </Button>
            <Button
              variant="outline"
              className="text-danger-600 border-danger-300 hover:bg-danger-50"
              icon={<FaTrash />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Task Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaProjectDiagram className="h-4 w-4 text-secondary-400 mr-3" />
                  <div>
                    <p className="text-sm text-secondary-600">Project</p>
                    <Link
                      to={`/projects/${task.project._id}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {task.project.name}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaUser className="h-4 w-4 text-secondary-400 mr-3" />
                  <div>
                    <p className="text-sm text-secondary-600">Assignee</p>
                    {task.assignee ? (
                      <div className="flex items-center mt-1">
                        <Avatar
                          src={task.assignee.avatar}
                          name={task.assignee.name}
                          size="xs"
                          className="mr-2"
                        />
                        <span className="font-medium text-secondary-900">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-secondary-400">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <FaUser className="h-4 w-4 text-secondary-400 mr-3" />
                  <div>
                    <p className="text-sm text-secondary-600">Reporter</p>
                    <div className="flex items-center mt-1">
                      <Avatar
                        src={task.reporter.avatar}
                        name={task.reporter.name}
                        size="xs"
                        className="mr-2"
                      />
                      <span className="font-medium text-secondary-900">{task.reporter.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FaCalendarAlt className="h-4 w-4 text-secondary-400 mr-3" />
                  <div>
                    <p className="text-sm text-secondary-600">Due Date</p>
                    <p className={`font-medium ${
                      isOverdue(task.dueDate) ? 'text-danger-600' :
                      isDueToday(task.dueDate) ? 'text-warning-600' :
                      'text-secondary-900'
                    }`}>
                      {formatDate(task.dueDate)}
                      {isOverdue(task.dueDate) && (
                        <span className="ml-2 text-xs bg-danger-100 text-danger-600 px-2 py-1 rounded-full">
                          Overdue
                        </span>
                      )}
                      {isDueToday(task.dueDate) && (
                        <span className="ml-2 text-xs bg-warning-100 text-warning-600 px-2 py-1 rounded-full">
                          Due Today
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaClock className="h-4 w-4 text-secondary-400 mr-3" />
                  <div>
                    <p className="text-sm text-secondary-600">Created</p>
                    <p className="font-medium text-secondary-900">{formatRelativeTime(task.createdAt)}</p>
                  </div>
                </div>

                {task.timeTracking && (
                  <div className="flex items-center">
                    <FaClock className="h-4 w-4 text-secondary-400 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-600">Time Tracking</p>
                      <p className="font-medium text-secondary-900">
                        {task.timeTracking.logged}h / {task.timeTracking.estimated}h
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <FaComments className="mr-2" />
              Comments ({task.comments?.length || 0})
            </h3>

            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex items-start space-x-3">
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  size="sm"
                />
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      loading={commentLoading}
                      disabled={!comment.trim()}
                      icon={<FaPaperPlane />}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {task.comments?.map((comment, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Avatar
                    src={comment.author?.avatar}
                    name={comment.author?.name}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-secondary-900">{comment.author?.name}</span>
                        <span className="text-xs text-secondary-500">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-secondary-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!task.comments || task.comments.length === 0) && (
                <p className="text-center text-secondary-500 py-4">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Status & Priority</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary-600 mb-2">Status</p>
                <Badge variant={getStatusColor(task.status)} className="mb-2">
                  {task.status.replace('-', ' ')}
                </Badge>
                {canEdit && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['todo', 'in-progress', 'review', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updateLoading}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          task.status === status
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                        }`}
                      >
                        {status.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-secondary-600 mb-2">Priority</p>
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Progress</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-secondary-600">Completion</span>
                  <span className="font-medium text-secondary-900">{task.progress}%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>

              {canEdit && (
                <div>
                  <p className="text-sm text-secondary-600 mb-2">Update Progress</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress || task.progress}
                      onChange={(e) => setProgress(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-secondary-900 w-12">
                      {progress || task.progress}%
                    </span>
                  </div>
                  <Button
                    onClick={() => handleProgressChange(progress || task.progress)}
                    loading={updateLoading}
                    size="sm"
                    className="w-full mt-2"
                  >
                    Update Progress
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {canEdit && (
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>

              <div className="space-y-2">
                {task.status === 'todo' && (
                  <Button
                    onClick={() => handleStatusChange('in-progress')}
                    loading={updateLoading}
                    icon={<FaPlay />}
                    className="w-full"
                    size="sm"
                  >
                    Start Task
                  </Button>
                )}

                {task.status === 'in-progress' && (
                  <>
                    <Button
                      onClick={() => handleStatusChange('review')}
                      loading={updateLoading}
                      icon={<FaPause />}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      Send for Review
                    </Button>
                    <Button
                      onClick={() => handleStatusChange('completed')}
                      loading={updateLoading}
                      icon={<FaCheck />}
                      className="w-full bg-success-600 hover:bg-success-700"
                      size="sm"
                    >
                      Mark Complete
                    </Button>
                  </>
                )}

                {task.status === 'review' && (
                  <Button
                    onClick={() => handleStatusChange('completed')}
                    loading={updateLoading}
                    icon={<FaCheck />}
                    className="w-full bg-success-600 hover:bg-success-700"
                    size="sm"
                  >
                    Approve & Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
