const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Signup and login
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Get total user count
router.get('/count', userController.getUserCount);

// CRUD operations
router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
