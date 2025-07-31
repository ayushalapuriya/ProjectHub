import React, { useState } from 'react';
import { Chart } from 'react-google-charts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import {
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaCalendarAlt,
  FaDownload,
  FaFilter,
  FaProjectDiagram,
  FaTasks,
  FaUsers,
  FaClock
} from 'react-icons/fa';
import { useApi } from '../hooks/useApi';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const Reports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');

  // Fetch data
  const { data: projectsData, loading: projectsLoading } = useApi(() => projectService.getProjects(), []);
  const { data: tasksData, loading: tasksLoading } = useApi(() => taskService.getTasks(), []);
  const { data: usersData, loading: usersLoading } = useApi(() => userService.getUsers(), []);

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];
  const users = usersData?.data || [];

  // Calculate analytics
  const analytics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    overdueTasks: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
    totalUsers: users.length,
    avgProjectProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  };

  // Prepare chart data
  const projectStatusData = [
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#f59e0b' },
    { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#3b82f6' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#6b7280' },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#10b981' },
    { name: 'Cancelled', value: projects.filter(p => p.status === 'cancelled').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const taskStatusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#6b7280' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#f59e0b' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' }
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Low', tasks: tasks.filter(t => t.priority === 'low').length, projects: projects.filter(p => p.priority === 'low').length },
    { name: 'Medium', tasks: tasks.filter(t => t.priority === 'medium').length, projects: projects.filter(p => p.priority === 'medium').length },
    { name: 'High', tasks: tasks.filter(t => t.priority === 'high').length, projects: projects.filter(p => p.priority === 'high').length },
    { name: 'Critical', tasks: tasks.filter(t => t.priority === 'critical').length, projects: projects.filter(p => p.priority === 'critical').length }
  ];

  // Gantt chart data
  const ganttData = [
    ['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies'],
    ...projects.slice(0, 10).map((project, index) => [
      `P${index + 1}`,
      project.name,
      project.manager?.name || 'Unassigned',
      new Date(project.startDate),
      new Date(project.endDate),
      null,
      project.progress,
      null
    ])
  ];

  const ganttOptions = {
    height: 400,
    gantt: {
      trackHeight: 30,
      criticalPathEnabled: true,
      criticalPathStyle: {
        stroke: '#e74c3c',
        strokeWidth: 5
      }
    }
  };

  if (projectsLoading || tasksLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-secondary-600">
            {user?.role === 'admin'
              ? 'Comprehensive analytics across all projects and teams'
              : user?.role === 'manager'
              ? 'Analytics for your projects and team performance'
              : 'View analytics for your assigned projects and tasks'
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button
            icon={<FaDownload />}
            variant="outline"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-100">
              <FaProjectDiagram className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Projects</p>
              <p className="text-2xl font-bold text-secondary-900">{analytics.totalProjects}</p>
              <p className="text-xs text-success-600">{analytics.activeProjects} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-success-100">
              <FaTasks className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Tasks</p>
              <p className="text-2xl font-bold text-secondary-900">{analytics.totalTasks}</p>
              <p className="text-xs text-success-600">{analytics.completedTasks} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warning-100">
              <FaClock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-secondary-900">{analytics.overdueTasks}</p>
              <p className="text-xs text-danger-600">Need attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-secondary-100">
              <FaUsers className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Team Members</p>
              <p className="text-2xl font-bold text-secondary-900">{analytics.totalUsers}</p>
              <p className="text-xs text-primary-600">Active users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'gantt', 'performance', 'team'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Status Chart */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Project Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Task Status Chart */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Task Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Priority Analysis */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Priority Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                    <Bar dataKey="tasks" fill="#10b981" name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'gantt' && (
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Project Timeline (Gantt Chart)</h3>
              {projects.length > 0 ? (
                <Chart
                  chartType="Gantt"
                  width="100%"
                  height="400px"
                  data={ganttData}
                  options={ganttOptions}
                />
              ) : (
                <div className="text-center py-12">
                  <FaCalendarAlt className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No Projects Found</h3>
                  <p className="text-secondary-600">Create some projects to see the Gantt chart.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Performance Metrics</h3>

              {/* Project Progress */}
              <div>
                <h4 className="text-md font-medium text-secondary-900 mb-4">Project Progress Overview</h4>
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <div key={project._id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">{project.name}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant={
                            project.status === 'completed' ? 'success' :
                            project.status === 'active' ? 'primary' :
                            project.status === 'planning' ? 'warning' : 'secondary'
                          }>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-secondary-900">{project.progress}%</p>
                        <div className="w-24 bg-secondary-200 rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full bg-primary-500 transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Performance */}
              <div>
                <h4 className="text-md font-medium text-secondary-900 mb-4">Team Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary-600">{analytics.avgProjectProgress}%</p>
                    <p className="text-sm text-secondary-600">Avg Project Progress</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-success-600">
                      {analytics.totalTasks > 0 ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0}%
                    </p>
                    <p className="text-sm text-secondary-600">Task Completion Rate</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-warning-600">
                      {analytics.totalTasks > 0 ? Math.round((analytics.overdueTasks / analytics.totalTasks) * 100) : 0}%
                    </p>
                    <p className="text-sm text-secondary-600">Overdue Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Team Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((member) => {
                  const memberTasks = tasks.filter(t => t.assignee?._id === member._id);
                  const completedTasks = memberTasks.filter(t => t.status === 'completed');

                  return (
                    <div key={member._id} className="bg-secondary-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{member.name}</p>
                          <p className="text-xs text-secondary-600 capitalize">{member.role}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary-600">Total Tasks:</span>
                          <span className="font-medium">{memberTasks.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary-600">Completed:</span>
                          <span className="font-medium text-success-600">{completedTasks.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary-600">Completion Rate:</span>
                          <span className="font-medium">
                            {memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
