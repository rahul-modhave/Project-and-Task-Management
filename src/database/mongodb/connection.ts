import mongoose from 'mongoose';
import { config } from '../../config';

let isConnected = false;

export const initDatabase = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  try {
    await mongoose.connect(config.db.uri, {
      // Recommended options for production stability
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`MongoDB connected successfully to: ${config.db.uri}`);
    return mongoose;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export const getMongoose = (): typeof mongoose => mongoose;

// Graceful disconnect (used during tests or shutdown)
export const disconnectDatabase = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected.');
  }
};
