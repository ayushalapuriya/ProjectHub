const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please run user seeder first.');
      process.exit(1);
    }

    const admin = users.find(u => u.role === 'admin');
    const manager = users.find(u => u.role === 'manager');
    const members = users.filter(u => u.role === 'member');

    // Clear existing data
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing projects, tasks, and notifications');

    // Create sample projects
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX and responsive design',
        status: 'active',
        priority: 'high',
        progress: 75,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        manager: manager._id,
        team: [
          { user: manager._id, role: 'manager' },
          { user: members[0]._id, role: 'developer' },
          { user: members[1]._id, role: 'designer' }
        ],
        budget: 50000,
        resources: [
          { name: 'Development Team', type: 'human', allocated: 120, available: 160, unit: 'hours' },
          { name: 'Design Software', type: 'software', allocated: 3, available: 5, unit: 'licenses' }
        ],
        tags: ['web', 'ui/ux', 'responsive']
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms with real-time features',
        status: 'planning',
        priority: 'medium',
        progress: 25,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-31'),
        manager: admin._id,
        team: [
          { user: admin._id, role: 'manager' },
          { user: members[1]._id, role: 'developer' },
          { user: members[2]._id, role: 'developer' }
        ],
        budget: 80000,
        resources: [
          { name: 'Mobile Dev Team', type: 'human', allocated: 200, available: 240, unit: 'hours' },
          { name: 'Testing Devices', type: 'equipment', allocated: 5, available: 8, unit: 'devices' }
        ],
        tags: ['mobile', 'ios', 'android', 'react-native']
      },
      {
        name: 'API Integration Platform',
        description: 'Integration platform for third-party APIs with comprehensive documentation',
        status: 'completed',
        priority: 'low',
        progress: 100,
        startDate: new Date('2023-10-01'),
        endDate: new Date('2023-12-31'),
        manager: manager._id,
        team: [
          { user: manager._id, role: 'manager' },
          { user: members[0]._id, role: 'backend-developer' }
        ],
        budget: 30000,
        resources: [
          { name: 'Backend Team', type: 'human', allocated: 80, available: 80, unit: 'hours' }
        ],
        tags: ['api', 'integration', 'backend']
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log(`Created ${createdProjects.length} projects`);

    // Create sample tasks
    const tasks = [
      // Website Redesign Tasks
      {
        title: 'Design Homepage Layout',
        description: 'Create modern homepage design with hero section, features, and call-to-action',
        status: 'completed',
        priority: 'high',
        progress: 100,
        startDate: new Date('2024-01-05'),
        dueDate: new Date('2024-01-20'),
        project: createdProjects[0]._id,
        assignee: members[1]._id,
        reporter: manager._id,
        timeTracking: { estimated: 40, logged: 38, remaining: 0 },
        tags: ['design', 'homepage']
      },
      {
        title: 'Implement Responsive Navigation',
        description: 'Build responsive navigation menu with mobile hamburger menu',
        status: 'in-progress',
        priority: 'high',
        progress: 70,
        startDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-05'),
        project: createdProjects[0]._id,
        assignee: members[0]._id,
        reporter: manager._id,
        timeTracking: { estimated: 24, logged: 16, remaining: 8 },
        tags: ['frontend', 'navigation']
      },
      {
        title: 'Setup Contact Form',
        description: 'Create contact form with validation and email integration',
        status: 'todo',
        priority: 'medium',
        progress: 0,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-02-15'),
        project: createdProjects[0]._id,
        assignee: members[0]._id,
        reporter: manager._id,
        timeTracking: { estimated: 16, logged: 0, remaining: 16 },
        tags: ['frontend', 'forms']
      },
      // Mobile App Tasks
      {
        title: 'Setup React Native Project',
        description: 'Initialize React Native project with navigation and basic structure',
        status: 'completed',
        priority: 'high',
        progress: 100,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-02-10'),
        project: createdProjects[1]._id,
        assignee: members[1]._id,
        reporter: admin._id,
        timeTracking: { estimated: 16, logged: 14, remaining: 0 },
        tags: ['mobile', 'setup']
      },
      {
        title: 'Design App UI Components',
        description: 'Create reusable UI components for the mobile application',
        status: 'in-progress',
        priority: 'medium',
        progress: 45,
        startDate: new Date('2024-02-10'),
        dueDate: new Date('2024-03-01'),
        project: createdProjects[1]._id,
        assignee: members[2]._id,
        reporter: admin._id,
        timeTracking: { estimated: 32, logged: 14, remaining: 18 },
        tags: ['mobile', 'ui', 'components']
      },
      // API Integration Tasks
      {
        title: 'API Documentation',
        description: 'Write comprehensive API documentation with examples',
        status: 'completed',
        priority: 'medium',
        progress: 100,
        startDate: new Date('2023-11-01'),
        dueDate: new Date('2023-11-30'),
        project: createdProjects[2]._id,
        assignee: members[0]._id,
        reporter: manager._id,
        timeTracking: { estimated: 24, logged: 26, remaining: 0 },
        tags: ['documentation', 'api']
      }
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`Created ${createdTasks.length} tasks`);

    // Add comments to some tasks
    const taskWithComments = await Task.findById(createdTasks[1]._id);
    taskWithComments.comments.push({
      text: 'Great progress on the navigation! The mobile menu looks fantastic.',
      author: manager._id,
      createdAt: new Date('2024-01-25')
    });
    taskWithComments.comments.push({
      text: 'Thanks! Working on the dropdown animations next.',
      author: members[0]._id,
      createdAt: new Date('2024-01-26')
    });
    await taskWithComments.save();

    // Create sample notifications
    const notifications = [
      {
        title: 'Task Assigned',
        message: 'You have been assigned to task "Implement Responsive Navigation"',
        type: 'task_assigned',
        priority: 'medium',
        user: members[0]._id,
        relatedId: createdTasks[1]._id,
        relatedType: 'task',
        isRead: false
      },
      {
        title: 'Project Updated',
        message: 'Project "Website Redesign" progress updated to 75%',
        type: 'project_updated',
        priority: 'low',
        user: manager._id,
        relatedId: createdProjects[0]._id,
        relatedType: 'project',
        isRead: true
      },
      {
        title: 'Task Completed',
        message: 'Task "Design Homepage Layout" has been completed',
        type: 'task_completed',
        priority: 'low',
        user: manager._id,
        relatedId: createdTasks[0]._id,
        relatedType: 'task',
        isRead: false
      }
    ];

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications`);

    console.log('\n✅ Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${createdProjects.length} Projects`);
    console.log(`- ${createdTasks.length} Tasks`);
    console.log(`- ${notifications.length} Notifications`);
    console.log('\n🚀 You can now test the full application with real data!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
