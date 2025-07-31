import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaProjectDiagram, FaUsers, FaTasks, FaChartLine, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',
    department: '',
    skills: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    } else if (!['member', 'manager', 'admin'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department.trim(),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      };

      await register(userData);
      toast.success('Registration successful!');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <div className="min-h-screen flex">
        {/* Left side - Registration Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary-600 p-3 rounded-lg mr-3">
                  <FaUserPlus className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-secondary-900">Join ProjectHub</h1>
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                Create your account
              </h2>
              <p className="text-secondary-600 mb-4">
                Start managing your projects efficiently
              </p>
              <p className="text-sm text-secondary-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-secondary-100">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        errors.name
                          ? 'border-danger-300 bg-danger-50'
                          : 'border-secondary-300 hover:border-secondary-400'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-danger-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        errors.email
                          ? 'border-danger-300 bg-danger-50'
                          : 'border-secondary-300 hover:border-secondary-400'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-danger-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-secondary-700 mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        errors.role
                          ? 'border-danger-300 bg-danger-50'
                          : 'border-secondary-300 hover:border-secondary-400'
                      }`}
                    >
                      <option value="member">Team Member</option>
                      <option value="manager">Project Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                    {errors.role && (
                      <p className="mt-2 text-sm text-danger-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.role}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-secondary-500">
                      <div className="space-y-1">
                        <div><strong>Team Member:</strong> Can view projects and tasks, create tasks in assigned projects</div>
                        <div><strong>Project Manager:</strong> Can create and manage projects, invite team members</div>
                        <div><strong>Administrator:</strong> Full access to all features and system management</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                            errors.password
                              ? 'border-danger-300 bg-danger-50'
                              : 'border-secondary-300 hover:border-secondary-400'
                          }`}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                        >
                          {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-2 text-sm text-danger-600 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                            errors.confirmPassword
                              ? 'border-danger-300 bg-danger-50'
                              : 'border-secondary-300 hover:border-secondary-400'
                          }`}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                        >
                          {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-danger-600 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-secondary-700 mb-2">
                        Department <span className="text-secondary-400">(Optional)</span>
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-400 transition-colors"
                        placeholder="e.g., Engineering, Marketing"
                      />
                    </div>

                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-secondary-700 mb-2">
                        Skills <span className="text-secondary-400">(Optional)</span>
                      </label>
                      <input
                        id="skills"
                        name="skills"
                        type="text"
                        value={formData.skills}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-400 transition-colors"
                        placeholder="e.g., React, Node.js, PM"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-secondary-500 bg-secondary-50 p-3 rounded-lg">
                    <p className="mb-1">💡 <strong>Tips:</strong></p>
                    <p>• Use a strong password with at least 6 characters</p>
                    <p>• Add your skills to help with project assignments</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-primary-200"
                  size="lg"
                >
                  {loading ? 'Creating account...' : 'Create your account'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Right side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-600 to-secondary-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6">
                Join thousands of teams already using ProjectHub
              </h2>
              <p className="text-lg text-secondary-100 mb-8">
                Transform the way your team collaborates and delivers projects with our comprehensive project management platform.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4 mt-1">
                  <FaProjectDiagram className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Advanced Project Planning</h3>
                  <p className="text-secondary-200">Create detailed project plans with Gantt charts, milestones, and dependencies.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4 mt-1">
                  <FaTasks className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Smart Task Management</h3>
                  <p className="text-secondary-200">Organize tasks, set priorities, track progress, and never miss a deadline.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4 mt-1">
                  <FaUsers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Team Collaboration</h3>
                  <p className="text-secondary-200">Real-time updates, comments, file sharing, and seamless team communication.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4 mt-1">
                  <FaChartLine className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Insightful Analytics</h3>
                  <p className="text-secondary-200">Track performance, analyze trends, and make data-driven decisions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -ml-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white bg-opacity-10 rounded-full -mr-24 -mb-24"></div>
        </div>
      </div>
    </div>
  );
};

export default Register;
