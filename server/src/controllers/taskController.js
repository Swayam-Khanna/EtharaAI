const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, priority, status, dueDate, assignedTo, project } = req.body;

  // Check if project exists
  const projectDoc = await Project.findById(project);
  if (!projectDoc) {
    return next(new ErrorResponse('Project not found', 404));
  }

  // Check if assignee exists
  const userDoc = await User.findById(assignedTo);
  if (!userDoc) {
    return next(new ErrorResponse('Assigned user not found', 404));
  }

  // Automatically add assigned user to project if not already a member (Admin convenience)
  if (!projectDoc.members.includes(assignedTo)) {
    projectDoc.members.push(assignedTo);
    await projectDoc.save();
  }

  const task = await Task.create({
    title,
    description,
    priority: priority || 'Medium',
    status: status || 'Todo',
    dueDate,
    assignedTo,
    project,
    createdBy: req.user._id
  });

  const populatedTask = await Task.findById(task._id)
    .populate('project', 'title description')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: populatedTask
  });
});

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res, next) => {
  let query;
  const { projectId } = req.query;

  // Filter construction
  const filter = {};
  if (projectId) {
    filter.project = projectId;
  }

  // RBAC: Admins get all tasks (filtered by project if query passed)
  // Members only get tasks assigned to themselves
  if (req.user.role === 'admin') {
    query = Task.find(filter);
  } else {
    filter.assignedTo = req.user._id;
    query = Task.find(filter);
  }

  const tasks = await query
    .populate('project', 'title status')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .sort('dueDate');

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    count: tasks.length,
    data: tasks
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('project', 'title description')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  // RBAC check: Members can only view their own assigned tasks
  if (
    req.user.role !== 'admin' &&
    task.assignedTo._id.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorResponse('Forbidden: You are not assigned to this task', 403));
  }

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: task
  });
});

// @desc    Update task (Admin: full CRUD; Member: ONLY update own status)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  // RBAC Enforcer
  if (req.user.role === 'admin') {
    // Admins have full access to update any field
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('project', 'title')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } else {
    // Members can ONLY update task status and ONLY if the task is assigned to them
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Forbidden: You can only update tasks assigned to you', 403));
    }

    // Check if they are trying to modify other fields
    const updates = Object.keys(req.body);
    const isOnlyStatusUpdate = updates.every(key => key === 'status');

    if (!isOnlyStatusUpdate) {
      return next(new ErrorResponse('Forbidden: Members are only permitted to update the status field', 403));
    }

    task.status = req.body.status;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: populatedTask
    });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: {}
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
