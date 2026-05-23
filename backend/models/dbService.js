const crypto = require('crypto');
const db = require('../config/db');
const User = require('./User');
const Chat = require('./Chat');
const SavedCode = require('./SavedCode');

// Helper to standardise MongoDB IDs or generated string UUIDs
const normalizeId = (obj) => {
  if (!obj) return null;
  const doc = obj.toObject ? obj.toObject() : obj;
  return {
    ...doc,
    _id: doc._id ? doc._id.toString() : doc.id,
    id: doc._id ? doc._id.toString() : doc.id
  };
};

const dbService = {
  // USER OPERATIONS
  getUserByEmail: async (email) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user ? { ...user, _id: user.id } : null;
    } else {
      const user = await User.findOne({ email });
      return normalizeId(user);
    }
  },

  getUserById: async (id) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const user = data.users.find(u => u.id === id);
      return user ? { ...user, _id: user.id } : null;
    } else {
      const user = await User.findById(id);
      return normalizeId(user);
    }
  },

  createUser: async ({ username, email, password, googleId }) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const newUser = {
        id: crypto.randomUUID(),
        username,
        email,
        password,
        googleId: googleId || null,
        createdAt: new Date().toISOString()
      };
      data.users.push(newUser);
      db.writeMockDb(data);
      return { ...newUser, _id: newUser.id };
    } else {
      const newUser = new User({ username, email, password, googleId });
      const saved = await newUser.save();
      return normalizeId(saved);
    }
  },

  // CHAT OPERATIONS
  getChatsByUser: async (userId) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const chats = data.chats
        .filter(c => c.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return chats.map(c => ({ ...c, _id: c.id }));
    } else {
      const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
      return chats.map(normalizeId);
    }
  },

  getChatById: async (id) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const chat = data.chats.find(c => c.id === id);
      return chat ? { ...chat, _id: chat.id } : null;
    } else {
      const chat = await Chat.findById(id);
      return normalizeId(chat);
    }
  },

  createChat: async ({ userId, language, difficulty, prompt, response }) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const newChat = {
        id: crypto.randomUUID(),
        userId: userId.toString(),
        language,
        difficulty,
        prompt,
        response,
        messages: [],
        createdAt: new Date().toISOString()
      };
      data.chats.push(newChat);
      db.writeMockDb(data);
      return { ...newChat, _id: newChat.id };
    } else {
      const newChat = new Chat({
        userId,
        language,
        difficulty,
        prompt,
        response,
        messages: []
      });
      const saved = await newChat.save();
      return normalizeId(saved);
    }
  },

  updateChatMessages: async (id, messages) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const chatIndex = data.chats.findIndex(c => c.id === id);
      if (chatIndex === -1) return null;
      
      data.chats[chatIndex].messages = messages.map(m => ({
        id: m.id || crypto.randomUUID(),
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString()
      }));
      
      db.writeMockDb(data);
      return { ...data.chats[chatIndex], _id: id };
    } else {
      const chat = await Chat.findById(id);
      if (!chat) return null;
      chat.messages = messages;
      const saved = await chat.save();
      return normalizeId(saved);
    }
  },

  updateChatResponse: async (id, response) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const chatIndex = data.chats.findIndex(c => c.id === id);
      if (chatIndex === -1) return null;
      data.chats[chatIndex].response = response;
      db.writeMockDb(data);
      return { ...data.chats[chatIndex], _id: id };
    } else {
      const res = await Chat.updateOne({ _id: id }, { response });
      return res.modifiedCount > 0;
    }
  },

  deleteChat: async (id) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const filtered = data.chats.filter(c => c.id !== id);
      const isDeleted = filtered.length < data.chats.length;
      if (isDeleted) {
        data.chats = filtered;
        db.writeMockDb(data);
      }
      return isDeleted;
    } else {
      const res = await Chat.deleteOne({ _id: id });
      return res.deletedCount > 0;
    }
  },

  // SAVED CODE OPERATIONS
  getSavedCodesByUser: async (userId) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const codes = data.savedCodes
        .filter(c => c.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return codes.map(c => ({ ...c, _id: c.id }));
    } else {
      const codes = await SavedCode.find({ userId }).sort({ createdAt: -1 });
      return codes.map(normalizeId);
    }
  },

  saveCode: async ({ userId, title, language, code, explanation, complexity }) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const newCode = {
        id: crypto.randomUUID(),
        userId: userId.toString(),
        title,
        language,
        code,
        explanation,
        complexity,
        createdAt: new Date().toISOString()
      };
      data.savedCodes.push(newCode);
      db.writeMockDb(data);
      return { ...newCode, _id: newCode.id };
    } else {
      const newCode = new SavedCode({
        userId,
        title,
        language,
        code,
        explanation,
        complexity
      });
      const saved = await newCode.save();
      return normalizeId(saved);
    }
  },

  deleteSavedCode: async (id) => {
    if (db.useMock()) {
      const data = db.getMockDb();
      const filtered = data.savedCodes.filter(c => c.id !== id);
      const isDeleted = filtered.length < data.savedCodes.length;
      if (isDeleted) {
        data.savedCodes = filtered;
        db.writeMockDb(data);
      }
      return isDeleted;
    } else {
      const res = await SavedCode.deleteOne({ _id: id });
      return res.deletedCount > 0;
    }
  }
};

module.exports = dbService;
