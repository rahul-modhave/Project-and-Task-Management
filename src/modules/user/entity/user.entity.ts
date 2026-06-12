import { Schema, model, Document, Types } from 'mongoose';

export interface IUserEntity {
    _id: Types.ObjectId;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isVerified: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type UserEntityDocument = IUserEntity & Document;

const UserEntitySchema = new Schema<UserEntityDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        avatar: {
            type: String,
            default: null
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        lastLoginAt: {
            type: Date,
            default: null
        },
    },
    {
        timestamps: true, // Automatically creates createdAt and updatedAt
        collection: 'users', // Explicitly set collection name
    }
);

// Create index on email for faster lookups
UserEntitySchema.index({ email: 1 });

export const UserEntity = model<UserEntityDocument>('UserEntity', UserEntitySchema);
