const dbService = require('../models/dbService');

const chatController = {
  getUserChats: async (req, res) => {
    try {
      const chats = await dbService.getChatsByUser(req.user.id);
      res.status(200).json(chats);
    } catch (err) {
      console.error('Get chats error:', err);
      res.status(500).json({ message: 'Server error retrieving chat history.' });
    }
  },

  getChatDetail: async (req, res) => {
    try {
      const chat = await dbService.getChatById(req.params.id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found.' });
      }
      if (chat.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      res.status(200).json(chat);
    } catch (err) {
      console.error('Get chat detail error:', err);
      res.status(500).json({ message: 'Server error retrieving chat details.' });
    }
  },

  deleteChatSession: async (req, res) => {
    try {
      const chat = await dbService.getChatById(req.params.id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found.' });
      }
      if (chat.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      await dbService.deleteChat(req.params.id);
      res.status(200).json({ message: 'Chat session deleted successfully.' });
    } catch (err) {
      console.error('Delete chat error:', err);
      res.status(500).json({ message: 'Server error deleting chat session.' });
    }
  },

  saveCodeSnippet: async (req, res) => {
    try {
      const { title, language, code, explanation, complexity } = req.body;
      if (!title || !language || !code) {
        return res.status(400).json({ message: 'Title, language, and code are required.' });
      }

      const savedCode = await dbService.saveCode({
        userId: req.user.id,
        title,
        language,
        code,
        explanation,
        complexity
      });

      res.status(201).json({
        message: 'Code snippet saved successfully.',
        savedCode
      });
    } catch (err) {
      console.error('Save code error:', err);
      res.status(500).json({ message: 'Server error saving code snippet.' });
    }
  },

  getSavedCodes: async (req, res) => {
    try {
      const savedCodes = await dbService.getSavedCodesByUser(req.user.id);
      res.status(200).json(savedCodes);
    } catch (err) {
      console.error('Get saved codes error:', err);
      res.status(500).json({ message: 'Server error retrieving saved codes.' });
    }
  },

  deleteSavedSnippet: async (req, res) => {
    try {
      // Find item
      const savedCodes = await dbService.getSavedCodesByUser(req.user.id);
      const exists = savedCodes.some(c => c._id === req.params.id);
      if (!exists) {
        return res.status(404).json({ message: 'Saved code not found or access denied.' });
      }

      await dbService.deleteSavedCode(req.params.id);
      res.status(200).json({ message: 'Saved code snippet deleted successfully.' });
    } catch (err) {
      console.error('Delete saved code error:', err);
      res.status(500).json({ message: 'Server error deleting saved code.' });
    }
  }
};

module.exports = chatController;
