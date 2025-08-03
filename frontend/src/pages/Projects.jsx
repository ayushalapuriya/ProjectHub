import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import { formatDate } from '../utils/dateUtils';

const Projects = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjects({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter
      });
      setProjects(response.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter, priorityFilter]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchProjects();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the fetchProjects dependency
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
        <p className="text-danger-600">Error loading projects: {error}</p>
      </div>
    );
  }



  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Projects</h1>
          <p className="mt-1 text-sm text-secondary-600">
            {user?.role === 'admin'
              ? 'Manage all projects across the organization'
              : user?.role === 'manager'
              ? 'Manage your projects and track team progress'
              : 'View and collaborate on assigned projects'
            }
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="mt-4 sm:mt-0">
            <Button
              icon={<FaPlus />}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-700"
            >
              New Project
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter(project => project && project._id).map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="card hover:shadow-medium transition-shadow duration-200"
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 truncate">
                    {project.name}
                  </h3>
                  <Badge projectStatus={project.status}>
                    {project.status}
                  </Badge>
                </div>
                
                <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary-600">Progress</span>
                      <span className="text-secondary-900 font-medium">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="flex items-center">
                    <Avatar
                      src={project.manager?.avatar}
                      name={project.manager?.name}
                      size="sm"
                    />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-secondary-900">
                        {project.manager?.name}
                      </p>
                      <p className="text-xs text-secondary-500">Manager</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between text-xs text-secondary-500">
                    <span>Start: {formatDate(project.startDate)}</span>
                    <span>End: {formatDate(project.endDate)}</span>
                  </div>

                  {/* Team size */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-secondary-600">Team:</span>
                      <span className="ml-1 text-sm font-medium text-secondary-900">
                        {project.team?.length || 0} members
                      </span>
                    </div>
                    <Badge priority={project.priority}>
                      {project.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-secondary-400">
            <FaFilter className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">
            No projects found
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Projects;
