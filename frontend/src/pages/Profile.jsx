import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaBuilding, FaCog, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useAsyncOperation } from '../hooks/useApi';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { execute, loading } = useAsyncOperation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    skills: user?.skills?.join(', ') || '',
    avatar: user?.avatar || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      };

      await execute(() => updateProfile(updateData));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      skills: user?.skills?.join(', ') || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Profile Settings</h1>
          <p className="text-secondary-600 mt-1">Manage your personal information and preferences</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            icon={<FaEdit />}
            variant="outline"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-secondary-100">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  size="xl"
                  className="mx-auto"
                />
                <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-2">
                  <FaUser className="h-4 w-4 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-secondary-900 mb-1">{user?.name}</h2>
              <p className="text-secondary-600 mb-2">{user?.email}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-secondary-600">
                <FaBuilding className="h-4 w-4 mr-3" />
                <span className="text-sm">{user?.department || 'No department set'}</span>
              </div>
              <div className="flex items-center text-secondary-600">
                <FaCog className="h-4 w-4 mr-3" />
                <span className="text-sm">Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {user?.skills && user.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-secondary-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-secondary-100">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">Personal Information</h3>
              <p className="text-secondary-600 text-sm mt-1">Update your personal details and preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                      isEditing
                        ? 'border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                        : 'border-secondary-200 bg-secondary-50 text-secondary-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                      isEditing
                        ? 'border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                        : 'border-secondary-200 bg-secondary-50 text-secondary-600'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                      isEditing
                        ? 'border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                        : 'border-secondary-200 bg-secondary-50 text-secondary-600'
                    }`}
                    placeholder="e.g., Engineering, Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                      isEditing
                        ? 'border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                        : 'border-secondary-200 bg-secondary-50 text-secondary-600'
                    }`}
                    placeholder="e.g., React, Node.js, Project Management"
                  />
                  {isEditing && (
                    <p className="mt-1 text-xs text-secondary-500">
                      Separate skills with commas
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex items-center justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    icon={<FaTimes />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    icon={<FaSave />}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
