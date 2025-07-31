import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  FaUserPlus, 
  FaEnvelope, 
  FaClock, 
  FaCheck, 
  FaTimes,
  FaRedo,
  FaTrash,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { useApi, useAsyncOperation } from '../hooks/useApi';
import { invitationService } from '../services/invitationService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import InviteModal from '../components/team/InviteModal';

const Invitations = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { execute: executeCancel } = useAsyncOperation();
  const { execute: executeResend } = useAsyncOperation();

  const { data: invitationsData, loading, error, refetch } = useApi(
    () => invitationService.getInvitations({ status: statusFilter }),
    [statusFilter]
  );

  const invitations = invitationsData?.data || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'declined': return 'danger';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="h-4 w-4" />;
      case 'accepted': return <FaCheck className="h-4 w-4" />;
      case 'declined': return <FaTimes className="h-4 w-4" />;
      case 'expired': return <FaClock className="h-4 w-4" />;
      default: return <FaClock className="h-4 w-4" />;
    }
  };

  const handleCancel = async (invitationId) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    try {
      await executeCancel(() => invitationService.cancelInvitation(invitationId));
      toast.success('Invitation cancelled successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  };

  const handleResend = async (invitationId) => {
    try {
      await executeResend(() => invitationService.resendInvitation(invitationId));
      toast.success('Invitation resent successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to resend invitation');
    }
  };

  const copyInvitationLink = (token) => {
    const link = `${window.location.origin}/accept-invitation/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Invitation link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
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
        <p className="text-danger-600">Error loading invitations: {error}</p>
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
            <FaUserPlus className="mr-3 text-primary-600" />
            Team Invitations
          </h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage team invitations and track their status
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setShowInviteModal(true)}
            icon={<FaUserPlus />}
            className="bg-gradient-to-r from-primary-600 to-primary-700"
          >
            Send Invitation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4">
        <div className="flex items-center space-x-4">
          <FaFilter className="text-secondary-400" />
          <div className="flex space-x-2">
            {['', 'pending', 'accepted', 'declined', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-secondary-200">
          <FaUserPlus className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {statusFilter ? `No ${statusFilter} invitations` : 'No invitations sent'}
          </h3>
          <p className="text-secondary-600 mb-6">
            {statusFilter 
              ? `There are no invitations with ${statusFilter} status.`
              : 'Start building your team by sending invitations to new members.'
            }
          </p>
          {!statusFilter && (
            <Button
              onClick={() => setShowInviteModal(true)}
              icon={<FaUserPlus />}
            >
              Send First Invitation
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Invitee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Role & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Invited By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {invitations.map((invitation) => (
                  <tr key={invitation._id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <FaEnvelope className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">
                            {invitation.email}
                          </div>
                          {invitation.message && (
                            <div className="text-sm text-secondary-500 truncate max-w-xs">
                              "{invitation.message}"
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        <Badge variant={
                          invitation.role === 'admin' ? 'danger' :
                          invitation.role === 'manager' ? 'warning' : 'primary'
                        }>
                          {invitation.role}
                        </Badge>
                      </div>
                      {invitation.department && (
                        <div className="text-sm text-secondary-500 mt-1">
                          {invitation.department}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(invitation.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(invitation.status)}
                          <span className="ml-1 capitalize">{invitation.status}</span>
                        </div>
                      </Badge>
                      {invitation.status === 'pending' && new Date(invitation.expiresAt) < new Date() && (
                        <div className="text-xs text-danger-600 mt-1">
                          Expired
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {invitation.invitedBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      <div>{formatDate(invitation.createdAt)}</div>
                      <div className="text-xs">{formatRelativeTime(invitation.createdAt)}</div>
                      {invitation.status === 'pending' && (
                        <div className="text-xs text-warning-600 mt-1">
                          Expires {formatRelativeTime(invitation.expiresAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {invitation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => copyInvitationLink(invitation.token)}
                              className="text-primary-600 hover:text-primary-900 transition-colors"
                              title="Copy invitation link"
                            >
                              <FaEnvelope className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleResend(invitation._id)}
                              className="text-success-600 hover:text-success-900 transition-colors"
                              title="Resend invitation"
                            >
                              <FaRedo className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(invitation._id)}
                              className="text-danger-600 hover:text-danger-900 transition-colors"
                              title="Cancel invitation"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {invitation.status === 'accepted' && invitation.acceptedBy && (
                          <span className="text-success-600 text-xs">
                            Accepted by {invitation.acceptedBy.name}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default Invitations;
