import React, { useState } from 'react';
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaCog,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import { useApi } from '../hooks/useApi';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import InviteModal from '../components/team/InviteModal';

const Team = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: usersData, loading, error, refetch } = useApi(
    () => userService.getUsers({
      search: searchQuery,
      role: roleFilter,
      department: departmentFilter
    }),
    [searchQuery, roleFilter, departmentFilter]
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'member': return 'primary';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FaCog className="h-3 w-3" />;
      case 'manager': return <FaBriefcase className="h-3 w-3" />;
      case 'member': return <FaUsers className="h-3 w-3" />;
      default: return <FaUsers className="h-3 w-3" />;
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
        <p className="text-danger-600">Error loading team members: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const users = usersData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Team</h1>
          <p className="mt-1 text-sm text-secondary-600">
            {user?.role === 'admin'
              ? 'Manage team members, roles, and permissions'
              : user?.role === 'manager'
              ? 'View and collaborate with your team members'
              : 'Connect and collaborate with your colleagues'
            }
          </p>
        </div>
        {user?.role === 'admin' && (
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setShowInviteModal(true)}
              icon={<FaUserPlus />}
              className="bg-gradient-to-r from-primary-600 to-primary-700"
            >
              Invite Member
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Management">Management</option>
          </select>

          <div className="flex items-center text-sm text-secondary-600">
            <FaFilter className="mr-2" />
            {users.length} member{users.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Team Grid */}
      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-secondary-200">
          <FaUsers className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No team members found</h3>
          <p className="text-secondary-600 mb-4">
            {searchQuery || roleFilter || departmentFilter
              ? 'Try adjusting your filters to see more team members.'
              : 'Start building your team by inviting members.'
            }
          </p>
          {user?.role === 'admin' && (
            <Button icon={<FaUserPlus />}>
              Invite Member
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.filter(member => member && member._id).map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="lg"
                      className="mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {member.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <Badge variant={getRoleColor(member.role)} className="flex items-center">
                          {getRoleIcon(member.role)}
                          <span className="ml-1 capitalize">{member.role}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {(user?.role === 'admin' || user?._id === member._id) && (
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-secondary-400 hover:text-primary-600 transition-colors">
                        <FaEye className="h-4 w-4" />
                      </button>
                      {user?.role === 'admin' && (
                        <>
                          <button className="p-1 text-secondary-400 hover:text-primary-600 transition-colors">
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-secondary-400 hover:text-danger-600 transition-colors">
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-secondary-600">
                    <FaEnvelope className="h-4 w-4 mr-2" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  {member.department && (
                    <div className="flex items-center text-sm text-secondary-600">
                      <FaBriefcase className="h-4 w-4 mr-2" />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {member.skills && member.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                          +{member.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-secondary-900">0</p>
                    <p className="text-xs text-secondary-500">Active Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-secondary-900">0</p>
                    <p className="text-xs text-secondary-500">Completed Tasks</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      icon={<FaEnvelope />}
                    >
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      icon={<FaEye />}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          refetch();
        }}
      />
    </div>
  );
};

export default Team;
