import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activities, setActivities] = useState([
    // Mock activity for testing
    {
      id: 1,
      type: 'project_created',
      message: 'Welcome to ProjectHub! Your workspace is ready.',
      user: { name: 'System', avatar: null },
      timestamp: new Date(),
      data: null
    }
  ]);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          userId: user._id
        }
      });

      setSocket(newSocket);

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Join user's personal room for notifications
      newSocket.emit('join', user._id);

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 49)]);
        toast.info(notification.message, {
          position: 'top-right',
          autoClose: 5000,
        });
      });

      // Listen for activities
      newSocket.on('activity', (activity) => {
        setActivities(prev => [activity, ...prev.slice(0, 99)]);
      });

      newSocket.on('task_updated', (data) => {
        setActivities(prev => [{
          id: Date.now(),
          type: 'task_updated',
          message: `Task "${data.task.title}" was updated`,
          user: data.updatedBy,
          timestamp: new Date(),
          data: data.task
        }, ...prev.slice(0, 99)]);
      });

      newSocket.on('project_updated', (data) => {
        setActivities(prev => [{
          id: Date.now(),
          type: 'project_updated',
          message: `Project "${data.project.name}" was updated`,
          user: data.updatedBy,
          timestamp: new Date(),
          data: data.project
        }, ...prev.slice(0, 99)]);
      });

      // Listen for task updates
      newSocket.on('task-updated', (data) => {
        toast.info(`Task "${data.title}" has been updated`, {
          position: 'top-right',
          autoClose: 3000,
        });
      });

      // Listen for project updates
      newSocket.on('project-updated', (data) => {
        toast.info(`Project "${data.name}" has been updated`, {
          position: 'top-right',
          autoClose: 3000,
        });
      });

      // Handle connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinProject = (projectId) => {
    if (socket) {
      socket.emit('join-project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket) {
      socket.emit('leave-project', projectId);
    }
  };

  const emitTaskUpdate = (taskData) => {
    if (socket) {
      socket.emit('task-update', taskData);
    }
  };

  const emitProjectUpdate = (projectData) => {
    if (socket) {
      socket.emit('project-update', projectData);
    }
  };

  const value = {
    socket,
    onlineUsers,
    isConnected,
    activities,
    notifications,
    joinProject,
    leaveProject,
    emitTaskUpdate,
    emitProjectUpdate,
    addActivity: (activity) => setActivities(prev => [activity, ...prev.slice(0, 99)]),
    clearActivities: () => setActivities([]),
    addNotification: (notification) => setNotifications(prev => [notification, ...prev.slice(0, 49)]),
    clearNotifications: () => setNotifications([])
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    // Return default values instead of throwing error
    return {
      socket: null,
      onlineUsers: [],
      isConnected: false,
      activities: [],
      notifications: [],
      joinProject: () => {},
      leaveProject: () => {},
      emitTaskUpdate: () => {},
      emitProjectUpdate: () => {},
      addActivity: () => {},
      clearActivities: () => {},
      addNotification: () => {},
      clearNotifications: () => {}
    };
  }
  return context;
};

export default SocketContext;
