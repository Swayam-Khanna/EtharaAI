const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.get('/', protect, restrictTo('admin'), getUsers);

module.exports = router;
