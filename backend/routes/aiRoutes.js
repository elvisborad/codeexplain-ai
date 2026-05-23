const express = require('express');
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', authMiddleware, aiController.generateCode);
router.post('/followup', authMiddleware, aiController.chatFollowUp);

module.exports = router;
