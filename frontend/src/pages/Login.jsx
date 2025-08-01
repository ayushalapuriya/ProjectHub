import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaProjectDiagram, FaUsers, FaTasks, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="min-h-screen flex">
        {/* Left side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                  <FaProjectDiagram className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-bold">ProjectHub</h1>
              </div>
              <h2 className="text-2xl font-light mb-6">
                Streamline Your Project Management
              </h2>
              <p className="text-lg text-primary-100 mb-8">
                Collaborate efficiently, track progress seamlessly, and deliver projects on time with our comprehensive project management platform.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <FaProjectDiagram className="h-5 w-5 mr-3 text-primary-200" />
                <span>Advanced Project Planning & Gantt Charts</span>
              </div>
              <div className="flex items-center">
                <FaTasks className="h-5 w-5 mr-3 text-primary-200" />
                <span>Smart Task Management & Tracking</span>
              </div>
              <div className="flex items-center">
                <FaUsers className="h-5 w-5 mr-3 text-primary-200" />
                <span>Team Collaboration & Real-time Updates</span>
              </div>
              <div className="flex items-center">
                <FaChartLine className="h-5 w-5 mr-3 text-primary-200" />
                <span>Insightful Analytics & Reporting</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="lg:hidden mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary-600 p-3 rounded-lg mr-3">
                    <FaProjectDiagram className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-secondary-900">ProjectHub</h1>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                Welcome back!
              </h2>
              <p className="text-secondary-600">
                Sign in to your account to continue
              </p>
              <p className="mt-4 text-sm text-secondary-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-secondary-100">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
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
                    <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                          errors.password
                            ? 'border-danger-300 bg-danger-50'
                            : 'border-secondary-300 hover:border-secondary-400'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                      >
                        {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-danger-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                {/* Demo Login Buttons */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Quick Demo Login:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ email: 'admin@projecthub.com', password: 'password123' })}
                      className="px-3 py-2 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                    >
                      Admin Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ email: 'manager@projecthub.com', password: 'password123' })}
                      className="px-3 py-2 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                    >
                      Manager Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ email: 'member@projecthub.com', password: 'password123' })}
                      className="px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    >
                      Member Login
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-primary-200"
                  size="lg"
                >
                  {loading ? 'Signing in...' : 'Sign in to ProjectHub'}
                </Button>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                  <p className="text-xs text-secondary-600 text-center mb-2 font-medium">
                    Demo Credentials
                  </p>
                  <div className="text-xs text-secondary-500 space-y-1">
                    <p><strong>Admin:</strong> admin@projecthub.com / password123</p>
                    <p><strong>Manager:</strong> manager@projecthub.com / password123</p>
                    <p><strong>Member:</strong> member@projecthub.com / password123</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
