import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUsers,
  FaTasks,
  FaProjectDiagram,
  FaChartLine,
  FaUserPlus
} from 'react-icons/fa';
import { useApi, useAsyncOperation } from '../hooks/useApi';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import InviteModal from '../components/team/InviteModal';
import EditProjectModal from '../components/projects/EditProjectModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { execute: executeDelete, loading: deleteLoading } = useAsyncOperation();

  const { data: projectData, loading, error, refetch } = useApi(()=>{

    return projectService.getProject(id)
  },
    [id]);

    console.log(projectData)

  const { data: tasksData } = useApi(
    () => taskService.getTasks({ project: id }),
    [id]
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'warning';
      case 'active': return 'primary';
      case 'on-hold': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
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

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'secondary';
      case 'in-progress': return 'primary';
      case 'review': return 'warning';
      case 'completed': return 'success';
      default: return 'secondary';
    }
  };

  const handleEditProject = () => {
    setShowEditModal(true);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone and will also delete all associated tasks.')) {
      return;
    }

    try {
      await executeDelete(() => projectService.deleteProject(project._id));
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    refetch();
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
        <p className="text-danger-600">Error loading project: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const project = projectData?.data;
  const tasks = tasksData?.data || [];

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Project not found</p>
        <Link to="/projects">
          <Button className="mt-4">
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || project.manager._id === user?._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/projects"
            className="mr-4 p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">{project.name}</h1>
            <p className="text-secondary-600 mt-1">{project.description}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              icon={<FaEdit />}
              onClick={handleEditProject}
            >
              Edit Project
            </Button>
            <Button
              variant="outline"
              className="text-danger-600 border-danger-300 hover:bg-danger-50"
              icon={<FaTrash />}
              onClick={handleDeleteProject}
              loading={deleteLoading}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-100">
              <FaProjectDiagram className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Status</p>
              <Badge variant={getStatusColor(project.status)} className="mt-1">
                {project.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-success-100">
              <FaChartLine className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Progress</p>
              <p className="text-2xl font-bold text-secondary-900">{project.progress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warning-100">
              <FaTasks className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Tasks</p>
              <p className="text-2xl font-bold text-secondary-900">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-secondary-100">
              <FaUsers className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Team</p>
              <p className="text-2xl font-bold text-secondary-900">{project.team?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'tasks', 'team'].map((tab) => (
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Start Date
                    </label>
                    <p className="text-sm text-secondary-900">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      End Date
                    </label>
                    <p className="text-sm text-secondary-900">{formatDate(project.endDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Priority
                    </label>
                    <Badge variant={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Manager
                    </label>
                    <div className="flex items-center">
                      <Avatar
                        src={project.manager?.avatar}
                        name={project.manager?.name}
                        size="sm"
                      />
                      <span className="ml-2 text-sm text-secondary-900">
                        {project.manager?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-secondary-900">Tasks</h3>
                <Button
                  onClick={() => setShowCreateTaskModal(true)}
                  icon={<FaPlus />}
                  className="bg-gradient-to-r from-primary-600 to-primary-700"
                >
                  Add Task
                </Button>
              </div>

              {tasksData?.data?.length > 0 ? (
                <div className="space-y-3">
                  {tasksData.data.map((task) => (
                    <div
                      key={task._id}
                      className="border border-secondary-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/tasks/${task._id}`}
                            className="font-medium text-secondary-900 hover:text-primary-600 transition-colors"
                          >
                            <h4>{task.title}</h4>
                          </Link>
                          <p className="text-sm text-secondary-600 mt-1">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant={getTaskStatusColor(task.status)}>
                              {task.status.replace('-', ' ')}
                            </Badge>
                            <span className="text-xs text-secondary-500">
                              Due: {formatDate(task.dueDate)}
                            </span>
                            {task.assignedTo && (
                              <div className="flex items-center">
                                <Avatar
                                  src={task.assignedTo.avatar}
                                  name={task.assignedTo.name}
                                  size="xs"
                                />
                                <span className="ml-1 text-xs text-secondary-600">
                                  {task.assignedTo.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaTasks className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No tasks yet</h3>
                  <p className="text-secondary-600 mb-4">
                    Get started by creating your first task for this project.
                  </p>
                  <Button
                    onClick={() => setShowCreateTaskModal(true)}
                    icon={<FaPlus />}
                  >
                    Create First Task
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-secondary-900">Team Members</h3>
                {(user?.role === 'admin' || project.manager._id === user?._id) && (
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    icon={<FaUserPlus />}
                    className="bg-gradient-to-r from-success-600 to-success-700"
                  >
                    Invite Member
                  </Button>
                )}
              </div>

              {project.team?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.team.map((member) => (
                    <div
                      key={member._id}
                      className="border border-secondary-200 rounded-lg p-4"
                    >
                      <div className="flex items-center">
                        <Avatar
                          src={member.avatar}
                          name={member.name}
                          size="md"
                        />
                        <div className="ml-3">
                          <h4 className="font-medium text-secondary-900">{member.name}</h4>
                          <p className="text-sm text-secondary-600">{member.email}</p>
                          <Badge variant={member.role === 'admin' ? 'danger' : member.role === 'manager' ? 'warning' : 'primary'}>
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaUsers className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No team members</h3>
                  <p className="text-secondary-600 mb-4">
                    Invite team members to collaborate on this project.
                  </p>
                  {(user?.role === 'admin' || project.manager._id === user?._id) && (
                    <Button
                      onClick={() => setShowInviteModal(true)}
                      icon={<FaUserPlus />}
                    >
                      Invite First Member
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        projectId={project._id}
        project={project}
        onSuccess={() => {
          setShowCreateTaskModal(false);
          refetch();
        }}
      />

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          refetch();
        }}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        project={project}
      />
    </div>
  );
};

export default ProjectDetail;
