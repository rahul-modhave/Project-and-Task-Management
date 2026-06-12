import { Schema, model, Document, Types } from 'mongoose';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  emailVerified: boolean;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: UserStatus;
  metadata: Record<string, unknown>;
  lastLoginAt?: Date;
  deletedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = IUser & Document;

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    metadata: { type: Schema.Types.Mixed, default: {} },
    lastLoginAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,        // adds createdAt / updatedAt automatically
    versionKey: false,       // disables mongoose __v in favour of our own version field
  }
);

// Compound index for soft-delete queries
UserSchema.index({ email: 1, deletedAt: 1 });

export const User = model<UserDocument>('User', UserSchema);
