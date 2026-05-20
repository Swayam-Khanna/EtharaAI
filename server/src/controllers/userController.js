const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all users (for assigning tasks/members)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).select('name email role');
  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users
  });
});

module.exports = {
  getUsers
};
