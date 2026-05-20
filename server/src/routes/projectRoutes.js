const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema
} = require('../validators/projectValidator');

// Protect all project routes
router.use(protect);

router
  .route('/')
  .post(restrictTo('admin'), validate(createProjectSchema), createProject)
  .get(getProjects);

router
  .route('/:id')
  .get(getProjectById)
  .put(restrictTo('admin'), validate(updateProjectSchema), updateProject)
  .delete(restrictTo('admin'), deleteProject);

// Member assignment routes (Admin only)
router.post('/:id/members', restrictTo('admin'), validate(addMemberSchema), addProjectMember);
router.delete('/:id/members/:userId', restrictTo('admin'), removeProjectMember);

module.exports = router;
