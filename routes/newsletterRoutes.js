const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

router.post('/', newsletterController.subscribe);
router.get('/', newsletterController.getAllSubscribers); // For newsletter.html view

module.exports = router;
