const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = asyncHandler(async (req, res, next) => {
  const { title, description, status, members } = req.body;

  const project = await Project.create({
    title,
    description,
    createdBy: req.user._id,
    members: members || [],
    status: status || 'active'
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project
  });
});

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res, next) => {
  let query;

  // RBAC: Admins get all projects, Members only get assigned projects
  if (req.user.role === 'admin') {
    query = Project.find();
  } else {
    query = Project.find({ members: req.user._id });
  }

  const projects = await query
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    message: 'Projects retrieved successfully',
    count: projects.length,
    data: projects
  });
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role');

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  // RBAC Check: Members can only access their assigned projects
  if (
    req.user.role !== 'admin' &&
    !project.members.some(member => member._id.toString() === req.user._id.toString())
  ) {
    return next(new ErrorResponse('Forbidden: You are not a member of this project', 403));
  }

  res.status(200).json({
    success: true,
    message: 'Project retrieved successfully',
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('members', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  await Project.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
    data: {}
  });
});

// @desc    Add team member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addProjectMember = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  // Find the user by email
  const memberToAdd = await User.findOne({ email });
  if (!memberToAdd) {
    return next(new ErrorResponse(`No user found with email '${email}'`, 404));
  }

  // Check if duplicate member
  if (project.members.includes(memberToAdd._id)) {
    return next(new ErrorResponse('User is already a member of this project', 400));
  }

  // Add to project
  project.members.push(memberToAdd._id);
  await project.save();

  const updatedProject = await Project.findById(req.params.id)
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Team member added to project successfully',
    data: updatedProject
  });
});

// @desc    Remove team member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
const removeProjectMember = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  const { userId } = req.params;

  // Check if user is a member
  const memberIndex = project.members.indexOf(userId);
  if (memberIndex === -1) {
    return next(new ErrorResponse('User is not a member of this project', 400));
  }

  // Remove user from project members array
  project.members.splice(memberIndex, 1);
  await project.save();

  const updatedProject = await Project.findById(req.params.id)
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Team member removed from project successfully',
    data: updatedProject
  });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
};
