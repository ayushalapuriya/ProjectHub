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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    reviewStatus: '',
    reviewComments: ''
  });
  const { execute: executeComment, loading: commentLoading } = useAsyncOperation();
  const { execute: executeUpdate, loading: updateLoading } = useAsyncOperation();
  const { execute: executeReview, loading: reviewLoading } = useAsyncOperation();
  const { execute: executeDeleteComment, loading: deleteCommentLoading } = useAsyncOperation();

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
      await executeComment(() => taskService.addComment(id, comment));
      setComment('');
      toast.success('Comment added successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleReview = async (reviewStatus) => {
    try {
      await executeReview(() => taskService.reviewTask(id, {
        reviewStatus,
        reviewComments: reviewData.reviewComments
      }));
      toast.success(`Task ${reviewStatus} successfully!`);
      setShowReviewModal(false);
      setReviewData({ reviewStatus: '', reviewComments: '' });
      refetch();
    } catch (error) {
      toast.error(`Failed to ${reviewStatus} task`);
    }
  };

  const openReviewModal = (status) => {
    setReviewData({ ...reviewData, reviewStatus: status });
    setShowReviewModal(true);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await executeDeleteComment(() => taskService.deleteComment(id, commentId));
      toast.success('Comment deleted successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to delete comment');
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
  const canUpdateProgress = user?.role === 'admin' || task.assignee?._id === user?._id;
  const canReview = user?.role === 'admin' || task.project?.manager?._id === user?._id;

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
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-secondary-500">{formatRelativeTime(comment.createdAt)}</span>
                          {/* Delete button - only show to comment author, admin, or project manager */}
                          {(user?._id === comment.author?._id ||
                            user?.role === 'admin' ||
                            task.project?.manager?._id === user?._id) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              disabled={deleteCommentLoading}
                              className="text-danger-500 hover:text-danger-700 text-xs p-1 rounded hover:bg-danger-50 transition-colors"
                              title="Delete comment"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          )}
                        </div>
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

              {canUpdateProgress && (
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

              {!canUpdateProgress && task.assignee && (
                <div className="text-center py-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm text-secondary-600">
                    Only the assigned team member can update progress
                  </p>
                  <div className="flex items-center justify-center mt-2">
                    <Avatar
                      src={task.assignee.avatar}
                      name={task.assignee.name}
                      size="xs"
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-secondary-700">
                      {task.assignee.name}
                    </span>
                  </div>
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
                  <div className="space-y-2">
                    {/* Show review info */}
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <FaExclamationTriangle className="text-warning-600 mr-2" />
                        <span className="text-sm font-medium text-warning-800">
                          Task is under review
                        </span>
                      </div>
                      {task.reviewer && (
                        <div className="flex items-center text-sm text-warning-700">
                          <Avatar
                            src={task.reviewer.avatar}
                            name={task.reviewer.name}
                            size="xs"
                            className="mr-2"
                          />
                          Reviewer: {task.reviewer.name}
                        </div>
                      )}
                    </div>

                    {/* Review actions for managers */}
                    {canReview && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openReviewModal('approved')}
                          loading={reviewLoading}
                          icon={<FaCheck />}
                          className="flex-1 bg-success-600 hover:bg-success-700"
                          size="sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => openReviewModal('rejected')}
                          loading={reviewLoading}
                          icon={<FaExclamationTriangle />}
                          variant="outline"
                          className="flex-1 border-danger-300 text-danger-600 hover:bg-danger-50"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Show review result if already reviewed */}
                    {task.reviewStatus && (
                      <div className={`border rounded-lg p-3 ${
                        task.reviewStatus === 'approved'
                          ? 'bg-success-50 border-success-200'
                          : 'bg-danger-50 border-danger-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          <FaCheck className={`mr-2 ${
                            task.reviewStatus === 'approved' ? 'text-success-600' : 'text-danger-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            task.reviewStatus === 'approved' ? 'text-success-800' : 'text-danger-800'
                          }`}>
                            Task {task.reviewStatus}
                          </span>
                        </div>
                        {task.reviewComments && (
                          <p className={`text-sm ${
                            task.reviewStatus === 'approved' ? 'text-success-700' : 'text-danger-700'
                          }`}>
                            {task.reviewComments}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {reviewData.reviewStatus === 'approved' ? 'Approve Task' : 'Reject Task'}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Comments {reviewData.reviewStatus === 'rejected' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={reviewData.reviewComments}
                onChange={(e) => setReviewData({...reviewData, reviewComments: e.target.value})}
                placeholder={`Add your ${reviewData.reviewStatus === 'approved' ? 'approval' : 'rejection'} comments...`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="4"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowReviewModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReview(reviewData.reviewStatus)}
                loading={reviewLoading}
                className={`flex-1 ${
                  reviewData.reviewStatus === 'approved'
                    ? 'bg-success-600 hover:bg-success-700'
                    : 'bg-danger-600 hover:bg-danger-700'
                }`}
                disabled={reviewData.reviewStatus === 'rejected' && !reviewData.reviewComments.trim()}
              >
                {reviewData.reviewStatus === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
