import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaFilter,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaProjectDiagram,
  FaTasks,
  FaUsers,
  FaComments
} from 'react-icons/fa';
import { useApi, useAsyncOperation } from '../hooks/useApi';
import { notificationService } from '../services/notificationService';
import { formatRelativeTime } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const { execute: executeMarkRead } = useAsyncOperation();
  const { execute: executeMarkAllRead } = useAsyncOperation();
  const { execute: executeDelete } = useAsyncOperation();

  const { data: notificationsData, loading, error, refetch } = useApi(
    () => notificationService.getNotifications({
      isRead: filter === 'unread' ? false : filter === 'read' ? true : undefined
    }),
    [filter]
  );

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
      case 'task_updated':
      case 'task_completed':
        return <FaTasks className="h-4 w-4" />;
      case 'project_created':
      case 'project_updated':
        return <FaProjectDiagram className="h-4 w-4" />;
      case 'team_added':
        return <FaUsers className="h-4 w-4" />;
      case 'comment_added':
        return <FaComments className="h-4 w-4" />;
      case 'deadline_reminder':
        return <FaExclamationTriangle className="h-4 w-4" />;
      default:
        return <FaInfoCircle className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'danger';
    if (priority === 'medium') return 'warning';

    switch (type) {
      case 'task_completed':
        return 'success';
      case 'deadline_reminder':
        return 'warning';
      case 'task_assigned':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await executeMarkRead(() => notificationService.markAsRead(id));
      refetch();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await executeMarkAllRead(() => notificationService.markAllAsRead());
      refetch();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await executeDelete(() => notificationService.deleteNotification(id));
      refetch();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
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
        <p className="text-danger-600">Error loading notifications: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
            <FaBell className="mr-3 text-primary-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-danger-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-secondary-600">
            Stay updated with your project activities and team updates
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              icon={<FaCheckDouble />}
              variant="outline"
              size="sm"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4">
        <div className="flex items-center space-x-4">
          <FaFilter className="text-secondary-400" />
          <div className="flex space-x-2">
            {['all', 'unread', 'read'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === filterOption
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                {filterOption === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-secondary-200">
          <FaBell className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {filter === 'unread' ? 'No unread notifications' :
             filter === 'read' ? 'No read notifications' : 'No notifications'}
          </h3>
          <p className="text-secondary-600">
            {filter === 'unread'
              ? 'You\'re all caught up! No new notifications to review.'
              : filter === 'read'
              ? 'No notifications have been read yet.'
              : 'You\'ll see notifications here when there are updates on your projects and tasks.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                notification.isRead
                  ? 'border-secondary-200'
                  : 'border-primary-200 bg-primary-50/30'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${
                      notification.isRead ? 'bg-secondary-100' : 'bg-primary-100'
                    }`}>
                      <div className={`${
                        notification.isRead ? 'text-secondary-600' : 'text-primary-600'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-sm font-semibold ${
                          notification.isRead ? 'text-secondary-700' : 'text-secondary-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <Badge
                          variant={getNotificationColor(notification.type, notification.priority)}
                          size="sm"
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${
                        notification.isRead ? 'text-secondary-500' : 'text-secondary-700'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-secondary-400 mt-2">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-2 text-secondary-400 hover:text-primary-600 transition-colors"
                        title="Mark as read"
                      >
                        <FaCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 text-secondary-400 hover:text-danger-600 transition-colors"
                      title="Delete notification"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {notifications.length > 0 && notifications.length < (notificationsData?.total || 0) && (
        <div className="text-center">
          <Button variant="outline">
            Load More Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
