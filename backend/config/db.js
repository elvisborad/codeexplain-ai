const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MOCK_DB_FILE = path.join(__dirname, '..', 'local_db.json');

const initMockDb = () => {
  if (!fs.existsSync(MOCK_DB_FILE)) {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify({ users: [], chats: [], savedCodes: [] }, null, 2));
  }
};

const getMockDb = () => {
  initMockDb();
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_FILE, 'utf8'));
  } catch (e) {
    return { users: [], chats: [], savedCodes: [] };
  }
};

const writeMockDb = (data) => {
  fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2));
};

let useMock = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codeexplain';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000 // Fast fail
    });
    console.log('MongoDB connected successfully.');
    useMock = false;
  } catch (err) {
    console.warn('MongoDB local connection failed. Falling back to local file-based Mock Database.');
    useMock = true;
    initMockDb();
  }
};

module.exports = {
  connectDB,
  useMock: () => useMock,
  getMockDb,
  writeMockDb
};
