import { Schema, model, Document, Types } from 'mongoose';

export interface IProjectMember {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectMemberDocument = IProjectMember & Document;

const ProjectMemberSchema = new Schema<ProjectMemberDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const ProjectMember = model<ProjectMemberDocument>('ProjectMember', ProjectMemberSchema);
