import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log('✅ MongoDB connected');
  return mongoose;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
