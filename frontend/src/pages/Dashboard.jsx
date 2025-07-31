import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaProjectDiagram, 
  FaTasks, 
  FaUsers, 
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { userService } from '../services/userService';
import { formatRelativeTime, isOverdue, isDueToday } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import ActivityFeed from '../components/common/ActivityFeed';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: dashboardData, loading, error } = useApi(
    () => userService.getDashboard(),
    []
  );



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
        <p className="text-danger-600">Error loading dashboard: {error}</p>
      </div>
    );
  }

  const {
    projects = [],
    tasks = [],
    taskStats = {},
    projectStats = {},
    upcomingDeadlines = []
  } = dashboardData || {};

  const statsCards = [
    {
      title: 'Active Projects',
      value: projectStats?.active || 0,
      total: projectStats?.total || 0,
      icon: FaProjectDiagram,
      color: 'primary',
      link: '/projects'
    },
    {
      title: 'My Tasks',
      value: taskStats?.inProgress || 0,
      total: taskStats?.total || 0,
      icon: FaTasks,
      color: 'success',
      link: '/tasks'
    },
    {
      title: 'Overdue Tasks',
      value: taskStats?.overdue || 0,
      total: taskStats?.total || 0,
      icon: FaExclamationTriangle,
      color: 'danger',
      link: '/tasks?status=overdue'
    },
    {
      title: 'Completed Today',
      value: taskStats?.completed || 0,
      total: taskStats?.total || 0,
      icon: FaCheckCircle,
      color: 'success',
      link: '/tasks?status=completed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-primary-100 text-lg">
                {user?.role === 'admin'
                  ? 'Monitor and manage all projects across your organization.'
                  : user?.role === 'manager'
                  ? 'Track your team\'s progress and manage project deliverables.'
                  : 'Stay updated on your tasks and project contributions.'
                }
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-primary-200 text-sm">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex items-center text-primary-200 text-sm">
                  <span className="mr-2">Role:</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                <FaProjectDiagram className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-secondary-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${
                    stat.color === 'primary' ? 'from-primary-500 to-primary-600' :
                    stat.color === 'success' ? 'from-success-500 to-success-600' :
                    stat.color === 'danger' ? 'from-danger-500 to-danger-600' :
                    'from-warning-500 to-warning-600'
                  } shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-secondary-600 mb-1">
                  {stat.title}
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-secondary-900">
                    {stat.value}
                  </p>
                  <span className="text-lg font-medium text-secondary-400 ml-1">
                    /{stat.total}
                  </span>
                </div>
                <div className="mt-2 w-full bg-secondary-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      stat.color === 'primary' ? 'bg-primary-500' :
                      stat.color === 'success' ? 'bg-success-500' :
                      stat.color === 'danger' ? 'bg-danger-500' :
                      'bg-warning-500'
                    }`}
                    style={{ width: `${stat.total > 0 ? (stat.value / stat.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <span className="text-secondary-600">→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-secondary-900">
                Recent Projects
              </h3>
              <Link to="/projects">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className="card-body">
            {projects && projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="block p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary-900">
                          {project.name}
                        </h4>
                        <p className="text-sm text-secondary-600 mt-1">
                          Progress: {project.progress}%
                        </p>
                      </div>
                      <Badge projectStatus={project.status}>
                        {project.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaProjectDiagram className="mx-auto h-12 w-12 text-secondary-400" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900">
                  No projects
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Get started by creating a new project.
                </p>
                <div className="mt-6">
                  <Link to="/projects">
                    <Button icon={<FaPlus />}>
                      New Project
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-secondary-900">
                Upcoming Deadlines
              </h3>
              <Link to="/tasks">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className="card-body">
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((task) => (
                  <Link
                    key={task._id}
                    to={`/tasks/${task._id}`}
                    className="block p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-900">
                          {task.title}
                        </h4>
                        <p className="text-sm text-secondary-600 mt-1">
                          {task.project?.name}
                        </p>
                        <div className="flex items-center mt-2">
                          <FaClock className={`h-4 w-4 mr-1 ${
                            isOverdue(task.dueDate) ? 'text-danger-500' :
                            isDueToday(task.dueDate) ? 'text-warning-500' :
                            'text-secondary-400'
                          }`} />
                          <span className={`text-sm ${
                            isOverdue(task.dueDate) ? 'text-danger-600' :
                            isDueToday(task.dueDate) ? 'text-warning-600' :
                            'text-secondary-600'
                          }`}>
                            {formatRelativeTime(task.dueDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge priority={task.priority}>
                          {task.priority}
                        </Badge>
                        <Badge status={task.status}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaClock className="mx-auto h-12 w-12 text-secondary-400" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900">
                  No upcoming deadlines
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900">
              Recent Tasks
            </h3>
            <Link to="/tasks">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </div>
        <div className="card-body">
          {tasks && tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Task</th>
                    <th className="table-header-cell">Project</th>
                    <th className="table-header-cell">Assignee</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Due Date</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td className="table-cell">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="font-medium text-primary-600 hover:text-primary-800"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <Link
                          to={`/projects/${task.project._id}`}
                          className="text-secondary-600 hover:text-secondary-800"
                        >
                          {task.project.name}
                        </Link>
                      </td>
                      <td className="table-cell">
                        {task.assignee ? (
                          <div className="flex items-center">
                            <Avatar
                              src={task.assignee.avatar}
                              name={task.assignee.name}
                              size="sm"
                            />
                            <span className="ml-2">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-secondary-400">Unassigned</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <Badge status={task.status}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <span className={
                          isOverdue(task.dueDate) ? 'text-danger-600' :
                          isDueToday(task.dueDate) ? 'text-warning-600' :
                          'text-secondary-600'
                        }>
                          {formatRelativeTime(task.dueDate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaTasks className="mx-auto h-12 w-12 text-secondary-400" />
              <h3 className="mt-2 text-sm font-medium text-secondary-900">
                No tasks
              </h3>
              <p className="mt-1 text-sm text-secondary-500">
                Get started by creating a new task.
              </p>
              <div className="mt-6">
                <Link to="/tasks">
                  <Button icon={<FaPlus />}>
                    New Task
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed limit={8} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
