import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaBell, FaSearch, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { notificationService } from '../../services/notificationService';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const { data: notifications } = useApi(
    () => notificationService.getNotifications({ limit: 5, isRead: false }),
    []
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search:', searchQuery);
  };

  const unreadCount = notifications?.unreadCount || 0;

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 lg:hidden"
          >
            <FaBars className="h-5 w-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="ml-4 flex-1 max-w-lg">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects, tasks, or team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md"
            >
              <FaBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4 border-b border-secondary-200">
                  <h3 className="text-sm font-medium text-secondary-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications?.data?.length > 0 ? (
                    notifications.data.map((notification) => (
                      <div
                        key={notification._id}
                        className="p-4 border-b border-secondary-100 hover:bg-secondary-50"
                      >
                        <p className="text-sm font-medium text-secondary-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-secondary-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-secondary-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-secondary-500">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-secondary-200">
                  <button className="w-full text-center text-sm text-primary-600 hover:text-primary-800">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md"
            >
              <Avatar src={user?.avatar} name={user?.name} size="sm" />
              <FaChevronDown className="ml-2 h-3 w-3" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4 border-b border-secondary-200">
                  <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                  <p className="text-xs text-secondary-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    Profile
                  </a>
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    Settings
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
