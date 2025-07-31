import React from 'react';
import { 
  FaProjectDiagram, 
  FaTasks, 
  FaComments, 
  FaUsers, 
  FaUserPlus,
  FaEdit,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import Avatar from './Avatar';
import Badge from './Badge';

const ActivityFeed = ({ limit = 10, showHeader = true }) => {
  const { activities = [], isConnected = false } = useSocket() || {};

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project_updated':
      case 'project_created':
        return <FaProjectDiagram className="h-4 w-4 text-primary-600" />;
      case 'task_updated':
      case 'task_created':
        return <FaTasks className="h-4 w-4 text-success-600" />;
      case 'task_assigned':
        return <FaUserPlus className="h-4 w-4 text-warning-600" />;
      case 'task_completed':
        return <FaCheckCircle className="h-4 w-4 text-success-600" />;
      case 'comment_added':
        return <FaComments className="h-4 w-4 text-secondary-600" />;
      case 'user_joined':
        return <FaUsers className="h-4 w-4 text-primary-600" />;
      default:
        return <FaEdit className="h-4 w-4 text-secondary-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'project_updated':
      case 'project_created':
        return 'bg-primary-100';
      case 'task_updated':
      case 'task_created':
        return 'bg-success-100';
      case 'task_assigned':
        return 'bg-warning-100';
      case 'task_completed':
        return 'bg-success-100';
      case 'comment_added':
        return 'bg-secondary-100';
      case 'user_joined':
        return 'bg-primary-100';
      default:
        return 'bg-secondary-100';
    }
  };

  const displayedActivities = Array.isArray(activities) ? activities.slice(0, limit) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
      {showHeader && (
        <div className="px-6 py-4 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
              <FaClock className="mr-2 text-primary-600" />
              Recent Activity
            </h3>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-success-500' : 'bg-danger-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                isConnected ? 'text-success-600' : 'text-danger-600'
              }`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <FaClock className="mx-auto h-8 w-8 text-secondary-400 mb-3" />
            <p className="text-secondary-600 text-sm">No recent activity</p>
            <p className="text-secondary-500 text-xs mt-1">
              Activity will appear here as your team works on projects
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {activity.user && (
                      <Avatar
                        src={activity.user.avatar}
                        name={activity.user.name}
                        size="xs"
                      />
                    )}
                    <p className="text-sm text-secondary-900 font-medium">
                      {activity.user?.name || 'System'}
                    </p>
                    <span className="text-xs text-secondary-500">
                      {formatRelativeTime(activity.timestamp || activity.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-secondary-700 mb-2">
                    {activity.message}
                  </p>

                  {/* Additional data based on activity type */}
                  {activity.data && (
                    <div className="mt-2">
                      {activity.type === 'project_updated' && activity.data.status && (
                        <Badge variant={
                          activity.data.status === 'completed' ? 'success' :
                          activity.data.status === 'active' ? 'primary' :
                          activity.data.status === 'planning' ? 'warning' : 'secondary'
                        } size="sm">
                          {activity.data.status}
                        </Badge>
                      )}
                      
                      {activity.type === 'task_updated' && activity.data.progress !== undefined && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-secondary-600">Progress:</span>
                          <div className="w-16 bg-secondary-200 rounded-full h-1">
                            <div
                              className="h-1 rounded-full bg-primary-500 transition-all duration-300"
                              style={{ width: `${activity.data.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-secondary-900">
                            {activity.data.progress}%
                          </span>
                        </div>
                      )}

                      {activity.type === 'comment_added' && activity.data.comment && (
                        <div className="bg-secondary-50 rounded-lg p-2 mt-1">
                          <p className="text-xs text-secondary-700 italic">
                            "{activity.data.comment.text}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length > limit && (
          <div className="mt-4 pt-4 border-t border-secondary-200 text-center">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Activity ({activities.length} total)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
