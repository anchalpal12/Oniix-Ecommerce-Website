const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

router.post('/', newsletterController.subscribe);
router.get('/', authenticateToken, authorizeAdmin, newsletterController.getAllSubscribers);

module.exports = router;
