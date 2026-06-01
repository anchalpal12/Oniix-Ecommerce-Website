const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signupRules, loginRules } = require('../validators/userValidators');

router.post('/signup', signupRules, validate, userController.signup);
router.post('/login', loginRules, validate, userController.login);

router.get('/me', authenticateToken, userController.getMe);

router.get('/count', authenticateToken, authorizeAdmin, userController.getUserCount);
router.get('/', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.put('/:id', authenticateToken, authorizeAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, authorizeAdmin, userController.deleteUser);

module.exports = router;
