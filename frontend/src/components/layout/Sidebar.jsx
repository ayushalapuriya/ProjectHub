import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaProjectDiagram,
  FaTasks,
  FaUsers,
  FaUserPlus,
  FaBell,
  FaChartBar,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FaHome },
    { name: 'Projects', href: '/projects', icon: FaProjectDiagram },
    { name: 'Tasks', href: '/tasks', icon: FaTasks },
    { name: 'Team', href: '/team', icon: FaUsers },
    ...(user?.role === 'admin' || user?.role === 'manager' ? [
      { name: 'Invitations', href: '/invitations', icon: FaUserPlus }
    ] : []),
    { name: 'Reports', href: '/reports', icon: FaChartBar },
    { name: 'Notifications', href: '/notifications', icon: FaBell },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-secondary-600 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">ProjectHub</h1>
          </div>

          {/* User info */}
          <div className="flex items-center p-4 border-b border-secondary-200">
            <Avatar src={user?.avatar} name={user?.name} size="md" />
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
              <p className="text-xs text-secondary-500">{user?.role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                             location.pathname.startsWith(item.href + '/');
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    sidebar-link
                    ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
                  `}
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-2 border-t border-secondary-200">
            <NavLink
              to="/settings"
              className={`
                sidebar-link mb-2
                ${location.pathname === '/settings' ? 'sidebar-link-active' : 'sidebar-link-inactive'}
              `}
              onClick={onClose}
            >
              <FaCog className="mr-3 h-5 w-5" />
              Settings
            </NavLink>
            
            <button
              onClick={handleLogout}
              className="sidebar-link sidebar-link-inactive w-full text-left"
            >
              <FaSignOutAlt className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
