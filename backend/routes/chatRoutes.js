const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, chatController.getUserChats);
router.get('/:id', authMiddleware, chatController.getChatDetail);
router.delete('/:id', authMiddleware, chatController.deleteChatSession);
router.post('/save', authMiddleware, chatController.saveCodeSnippet);
router.get('/saved/all', authMiddleware, chatController.getSavedCodes);
router.delete('/saved/:id', authMiddleware, chatController.deleteSavedSnippet);

module.exports = router;
