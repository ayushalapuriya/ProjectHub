const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@projecthub.com',
        password: 'password123',
        role: 'admin',
        department: 'Management',
        skills: ['Leadership', 'Strategy', 'Project Management']
      },
      {
        name: 'Project Manager',
        email: 'manager@projecthub.com',
        password: 'password123',
        role: 'manager',
        department: 'Engineering',
        skills: ['Project Management', 'Agile', 'Scrum', 'Team Leadership']
      },
      {
        name: 'Team Member',
        email: 'member@projecthub.com',
        password: 'password123',
        role: 'member',
        department: 'Development',
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB']
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@projecthub.com',
        password: 'password123',
        role: 'member',
        department: 'Design',
        skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite']
      },
      {
        name: 'Mike Chen',
        email: 'mike@projecthub.com',
        password: 'password123',
        role: 'member',
        department: 'Engineering',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker']
      }
    ];

    // Create users (password will be hashed by the User model pre-save hook)
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.name} (${userData.email})`);
    }

    console.log('Demo users created successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@projecthub.com / password123');
    console.log('Manager: manager@projecthub.com / password123');
    console.log('Member: member@projecthub.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
