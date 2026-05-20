const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard metrics and analytics
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const userId = req.user._id;

  // Filters based on Role (RBAC)
  const projectFilter = isAdmin ? {} : { members: userId };
  const taskFilter = isAdmin ? {} : { assignedTo: userId };

  // --- Projects Metrics ---
  const totalProjects = await Project.countDocuments(projectFilter);
  const activeProjects = await Project.countDocuments({ ...projectFilter, status: 'active' });
  const completedProjects = await Project.countDocuments({ ...projectFilter, status: 'completed' });
  const onHoldProjects = await Project.countDocuments({ ...projectFilter, status: 'on_hold' });

  // --- Tasks Metrics ---
  const totalTasks = await Task.countDocuments(taskFilter);
  const todoTasks = await Task.countDocuments({ ...taskFilter, status: 'Todo' });
  const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: 'In Progress' });
  const doneTasks = await Task.countDocuments({ ...taskFilter, status: 'Done' });

  // Overdue Tasks: Status is NOT 'Done' and due date is in the past
  const now = new Date();
  const overdueTasks = await Task.countDocuments({
    ...taskFilter,
    status: { $ne: 'Done' },
    dueDate: { $lt: now }
  });

  // --- Priority Distribution (For charts) ---
  const lowPriorityTasks = await Task.countDocuments({ ...taskFilter, priority: 'Low' });
  const mediumPriorityTasks = await Task.countDocuments({ ...taskFilter, priority: 'Medium' });
  const highPriorityTasks = await Task.countDocuments({ ...taskFilter, priority: 'High' });

  // --- Upcoming Deadlines (Max 5, closest due date) ---
  const upcomingDeadlines = await Task.find({
    ...taskFilter,
    status: { $ne: 'Done' }
  })
    .sort('dueDate')
    .limit(5)
    .populate('project', 'title')
    .populate('assignedTo', 'name email');

  // --- Recent Tasks (Max 5, sorted by creation date) ---
  const recentTasks = await Task.find(taskFilter)
    .sort('-createdAt')
    .limit(5)
    .populate('project', 'title')
    .populate('assignedTo', 'name email');

  res.status(200).json({
    success: true,
    message: 'Dashboard analytics fetched successfully',
    data: {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        onHold: onHoldProjects
      },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        overdue: overdueTasks
      },
      chartData: {
        taskPriority: [
          { name: 'Low', value: lowPriorityTasks, fill: '#52525b' },
          { name: 'Medium', value: mediumPriorityTasks, fill: '#a1a1aa' },
          { name: 'High', value: highPriorityTasks, fill: '#ffffff' }
        ],
        taskStatus: [
          { name: 'Todo', value: todoTasks },
          { name: 'In Progress', value: inProgressTasks },
          { name: 'Done', value: doneTasks }
        ]
      },
      upcomingDeadlines,
      recentTasks
    }
  });
});

module.exports = {
  getDashboardData
};
