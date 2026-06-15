import mongoose from 'mongoose';
import { config } from '../../config';
import { Task } from '../../modules/task/entity/task.entity';

let isConnected = false;

const dropLegacyTaskKeyIndex = async (): Promise<void> => {
  try {
    await Task.collection.dropIndex('key_1');
    console.log('Dropped legacy tasks.key unique index.');
  } catch (error: any) {
    if (error?.codeName === 'IndexNotFound' || error?.code === 27 || error?.codeName === 'NamespaceNotFound') {
      return;
    }

    throw error;
  }
};

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
    await dropLegacyTaskKeyIndex();
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
