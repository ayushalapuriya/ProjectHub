import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaTimes } from 'react-icons/fa';
import { useApi, useAsyncOperation } from '../../hooks/useApi';
import { notificationService } from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/dateUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import Badge from '../common/Badge';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { execute, loading } = useAsyncOperation();

  const { 
    data: notificationsData, 
    loading: fetchLoading, 
    error, 
    refetch 
  } = useApi(
    () => notificationService.getNotifications({ 
      isRead: filter === 'all' ? undefined : filter === 'unread' ? false : true,
      limit: 50 
    }),
    [filter]
  );

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await execute(() => notificationService.markAsRead(notificationId));
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await execute(() => notificationService.markAllAsRead());
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await execute(() => notificationService.deleteNotification(notificationId));
      refetch();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
      case 'task_updated':
      case 'task_completed':
        return '📋';
      case 'project_created':
      case 'project_updated':
        return '📁';
      case 'deadline_reminder':
      case 'task_overdue':
        return '⏰';
      case 'comment_added':
        return '💬';
      case 'team_added':
        return '👥';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-danger-600';
      case 'medium':
        return 'text-warning-600';
      case 'low':
        return 'text-secondary-600';
      default:
        return 'text-secondary-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-secondary-600 bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <div className="flex items-center">
              <FaBell className="h-5 w-5 text-secondary-600 mr-2" />
              <h2 className="text-lg font-semibold text-secondary-900">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <Badge variant="danger" size="sm" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-secondary-200">
            <div className="flex space-x-2">
              {['all', 'unread', 'read'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === filterOption
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
            
            {unreadCount > 0 && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  loading={loading}
                  icon={<FaCheck />}
                >
                  Mark all as read
                </Button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {fetchLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-danger-600">
                Error loading notifications: {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FaBell className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                <h3 className="text-sm font-medium text-secondary-900 mb-2">
                  No notifications
                </h3>
                <p className="text-sm text-secondary-500">
                  {filter === 'unread' 
                    ? "You're all caught up!" 
                    : "No notifications to show."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-secondary-50 transition-colors ${
                      !notification.isRead ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-secondary-900' : 'text-secondary-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-secondary-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="text-xs text-secondary-500">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                              <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="p-1 text-secondary-400 hover:text-primary-600"
                                title="Mark as read"
                              >
                                <FaCheck className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="p-1 text-secondary-400 hover:text-danger-600"
                              title="Delete"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
