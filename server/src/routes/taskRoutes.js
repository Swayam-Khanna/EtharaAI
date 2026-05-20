const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidator');

// Protect all task routes
router.use(protect);

router
  .route('/')
  .post(restrictTo('admin'), validate(createTaskSchema), createTask)
  .get(getTasks);

router
  .route('/:id')
  .get(getTaskById)
  .put(updateTask) // RBAC is checked dynamically inside updateTask in the controller (e.g. member can ONLY update status)
  .delete(restrictTo('admin'), deleteTask);

module.exports = router;
