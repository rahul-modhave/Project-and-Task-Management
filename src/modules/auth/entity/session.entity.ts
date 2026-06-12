import { Schema, model, Document, Types } from 'mongoose';

export interface ISession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  refreshToken: string;
  accessTokenJti: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  lastActivityAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionDocument = ISession & Document;

const SessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshToken: { type: String, required: true, unique: true, maxlength: 500 },
    accessTokenJti: { type: String, required: true, maxlength: 100 },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    lastActivityAt: { type: Date, default: () => new Date() },
    revokedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index to efficiently query active (non-revoked, non-expired) sessions per user
SessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

export const Session = model<SessionDocument>('Session', SessionSchema);
