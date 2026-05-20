const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { signupSchema, loginSchema } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

module.exports = router;
