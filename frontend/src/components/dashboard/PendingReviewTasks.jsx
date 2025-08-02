import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaExclamationTriangle, FaTasks } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import { taskService } from '../../services/taskService';
import { formatRelativeTime } from '../../utils/dateUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const PendingReviewTasks = () => {
  const { data: tasksData, loading, error } = useApi(
    () => taskService.getPendingReviewTasks(),
    []
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-danger-600 text-sm">Failed to load pending reviews</p>
      </div>
    );
  }

  const tasks = tasksData?.data || [];

  if (tasks.length === 0) {
    return (
      <div className="p-6 text-center">
        <FaTasks className="mx-auto h-8 w-8 text-secondary-400 mb-2" />
        <p className="text-secondary-600 text-sm">No tasks pending review</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-secondary-200">
      {tasks.slice(0, 5).map((task) => (
        <div key={task._id} className="p-4 hover:bg-secondary-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link
                to={`/tasks/${task._id}`}
                className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors"
              >
                {task.title}
              </Link>
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-secondary-500">
                  {task.project?.name}
                </span>
                <span className="text-xs text-secondary-400">•</span>
                <div className="flex items-center">
                  <Avatar
                    src={task.assignee?.avatar}
                    name={task.assignee?.name}
                    size="xs"
                    className="mr-1"
                  />
                  <span className="text-xs text-secondary-500">
                    {task.assignee?.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center mt-2 space-x-2">
                <Badge variant="warning" size="sm">
                  Pending Review
                </Badge>
                <span className="text-xs text-secondary-500">
                  {formatRelativeTime(task.updatedAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              <Link to={`/tasks/${task._id}`}>
                <Button
                  size="xs"
                  variant="outline"
                  className="text-xs px-2 py-1"
                >
                  Review
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {tasks.length > 5 && (
        <div className="p-4 text-center border-t border-secondary-200">
          <Link
            to="/tasks?status=review"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View {tasks.length - 5} more pending reviews
          </Link>
        </div>
      )}
    </div>
  );
};

export default PendingReviewTasks;
