const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seedDB = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management');
    console.log('[Seed] Database connected for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('[Seed] Cleared existing data.');

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    
    // Admin
    const admin = await User.create({
      name: 'Sarah Connor',
      email: 'admin@workspace.com',
      password: 'password123', // Automatically hashed by User model pre-save hook
      role: 'admin'
    });

    // Members
    const member1 = await User.create({
      name: 'John Doe',
      email: 'john@workspace.com',
      password: 'password123',
      role: 'member'
    });

    const member2 = await User.create({
      name: 'Alice Smith',
      email: 'alice@workspace.com',
      password: 'password123',
      role: 'member'
    });

    const member3 = await User.create({
      name: 'Bob Johnson',
      email: 'bob@workspace.com',
      password: 'password123',
      role: 'member'
    });

    console.log('[Seed] Users created successfully!');

    // 2. Create Projects
    console.log('[Seed] Creating demo projects...');

    const project1 = await Project.create({
      title: 'SaaS Platform Redesign',
      description: 'Revamping the core application landing page, dashboard navigation, responsive panels, and optimizing CSS performance for a premium user experience.',
      createdBy: admin._id,
      members: [member1._id, member2._id],
      status: 'active'
    });

    const project2 = await Project.create({
      title: 'Mobile App Integration',
      description: 'Building REST endpoints and wrapping API integration services for our native iOS and Android companion clients.',
      createdBy: admin._id,
      members: [member2._id, member3._id],
      status: 'active'
    });

    console.log('[Seed] Projects created successfully!');

    // 3. Create Tasks
    console.log('[Seed] Creating demo tasks...');

    // Dates
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 5); // 5 days ago to trigger "Overdue" task!

    // Project 1 Tasks
    await Task.create({
      title: 'Figma Layout Design',
      description: 'Draft the high-fidelity UI components, color palettes, and Bento layouts in Figma for the dark mode landing page.',
      priority: 'High',
      status: 'Todo',
      dueDate: nextWeek,
      assignedTo: member1._id,
      project: project1._id,
      createdBy: admin._id
    });

    await Task.create({
      title: 'Express Boilerplate Setup',
      description: 'Setup Express configuration, MongoDB schemas, Helmet protection, rate limiting, and validator middlewares.',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: nextWeek,
      assignedTo: member2._id,
      project: project1._id,
      createdBy: admin._id
    });

    await Task.create({
      title: 'JWT Token Security Service',
      description: 'Implement secure JWT signature verification and role-based access controllers (protect & restrictTo middleware).',
      priority: 'High',
      status: 'Done',
      dueDate: today,
      assignedTo: member2._id,
      project: project1._id,
      createdBy: admin._id
    });

    // Project 2 Tasks
    await Task.create({
      title: 'Mobile Push Notifications',
      description: 'Integrate SSE or WebSockets to push live alerts and toast events to mobile devices upon assignment.',
      priority: 'Low',
      status: 'Todo',
      dueDate: nextMonth,
      assignedTo: member3._id,
      project: project2._id,
      createdBy: admin._id
    });

    await Task.create({
      title: 'Legacy API Code Cleanup',
      description: 'Refactor old endpoints to follow consistent JSON structures and validate queries with Zod schemas.',
      priority: 'Medium',
      status: 'Todo',
      dueDate: pastDate, // Overdue!
      assignedTo: member2._id,
      project: project2._id,
      createdBy: admin._id
    });

    console.log('[Seed] Tasks created successfully!');
    console.log('[Seed] Seeding completed beautifully!');
    
    // Close DB Connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
