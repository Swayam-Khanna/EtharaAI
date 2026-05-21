const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set. Please configure your MongoDB connection string.');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    console.log(`[Database] Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    console.error(`[Database] Connection String: ${process.env.MONGODB_URI ? 'Set (hidden)' : 'NOT SET'}`);
    console.error('[Database] Please ensure:');
    console.error('  1. MONGODB_URI environment variable is set in Railway');
    console.error('  2. MongoDB connection string is valid');
    console.error('  3. Network access is allowed for your IP');
    process.exit(1);
  }
};

module.exports = connectDB;
