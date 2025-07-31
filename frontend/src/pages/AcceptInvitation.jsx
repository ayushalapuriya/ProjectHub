import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUserPlus, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaCheckCircle,
  FaTimesCircle,
  FaBriefcase
} from 'react-icons/fa';
import { invitationService } from '../services/invitationService';
import { useAuth } from '../context/AuthContext';
import { useApi, useAsyncOperation } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { execute, loading: acceptLoading } = useAsyncOperation();
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const { data: invitationData, loading, error } = useApi(
    () => invitationService.getInvitationByToken(token),
    [token]
  );

  const invitation = invitationData?.data;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await execute(() => 
        invitationService.acceptInvitation(token, {
          name: formData.name,
          password: formData.password
        })
      );
      
      toast.success('Welcome to ProjectHub! Your account has been created successfully.');
      
      // Auto-login the user
      await login(invitation.email, formData.password);
      
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async () => {
    try {
      await invitationService.declineInvitation(token);
      toast.info('Invitation declined');
      navigate('/');
    } catch (error) {
      toast.error('Failed to decline invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <FaTimesCircle className="mx-auto h-16 w-16 text-danger-500 mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Invalid Invitation</h1>
          <p className="text-secondary-600 mb-6">
            This invitation link is invalid, expired, or has already been used.
          </p>
          <Button onClick={() => navigate('/')}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <FaUserPlus className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">Join ProjectHub</h1>
          <p className="mt-2 text-secondary-600">
            You've been invited to join the team
          </p>
        </div>

        {/* Invitation Details */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <div className="text-center mb-6">
            <FaCheckCircle className="mx-auto h-12 w-12 text-success-500 mb-3" />
            <h2 className="text-xl font-semibold text-secondary-900">Invitation Details</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <FaEnvelope className="h-4 w-4 text-secondary-400 mr-3" />
              <div>
                <p className="text-sm text-secondary-600">Email</p>
                <p className="font-medium text-secondary-900">{invitation.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FaBriefcase className="h-4 w-4 text-secondary-400 mr-3" />
              <div>
                <p className="text-sm text-secondary-600">Role</p>
                <Badge variant={
                  invitation.role === 'admin' ? 'danger' :
                  invitation.role === 'manager' ? 'warning' : 'primary'
                }>
                  {invitation.role}
                </Badge>
              </div>
            </div>

            {invitation.department && (
              <div className="flex items-center">
                <FaBriefcase className="h-4 w-4 text-secondary-400 mr-3" />
                <div>
                  <p className="text-sm text-secondary-600">Department</p>
                  <p className="font-medium text-secondary-900">{invitation.department}</p>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <FaUser className="h-4 w-4 text-secondary-400 mr-3" />
              <div>
                <p className="text-sm text-secondary-600">Invited by</p>
                <p className="font-medium text-secondary-900">{invitation.invitedBy.name}</p>
              </div>
            </div>

            {invitation.message && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg border-l-4 border-primary-500">
                <p className="text-sm text-secondary-600 mb-1">Personal message:</p>
                <p className="text-secondary-900 italic">"{invitation.message}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Accept Form */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Create Your Account</h3>
          
          <form onSubmit={handleAccept} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.name ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                  }`}
                  placeholder="Enter your full name"
                />
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.password ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                  }`}
                  placeholder="Create a password"
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.confirmPassword ? 'border-danger-300 bg-danger-50' : 'border-secondary-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDecline}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                type="submit"
                loading={acceptLoading}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700"
              >
                Accept & Join
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-secondary-500">
            By accepting this invitation, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
