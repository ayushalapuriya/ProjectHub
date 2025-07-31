import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaTasks,
  FaComments,
  FaProjectDiagram,
  FaChartLine
} from 'react-icons/fa';
import { useApi } from '../hooks/useApi';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import CreateTaskModal from '../components/tasks/CreateTaskModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: projectData, loading, error, refetch } = useApi(
    () => projectService.getProject(id),
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
  const tasks = project?.tasks || [];

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
            >
              Edit Project
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

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        projectId={project._id}
        onSuccess={() => {
          setShowCreateTaskModal(false);
          refetch();
        }}
      />
    </div>
  );
};

export default ProjectDetail;
