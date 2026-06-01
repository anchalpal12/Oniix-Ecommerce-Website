const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/adminController');

router.get('/dashboard', authenticateToken, authorizeAdmin, getDashboardStats);

module.exports = router;
