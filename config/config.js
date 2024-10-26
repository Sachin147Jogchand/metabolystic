// db.js
const mongoose = require('mongoose');

// Replace the URI string with your MongoDB connection string
const MONGO_URI = process.env.MONGO_URI; // For local development

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Stop the app if there is a connection error
  }
};

module.exports = connectDB;

