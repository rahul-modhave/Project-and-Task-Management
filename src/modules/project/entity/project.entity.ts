import { Schema, model, Document, Types } from 'mongoose';

export enum ProjectStatus {
  ACTIVE = 'active',
  PLANNED = 'planned',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum ProjectMemberRole {
  TEAM_LEAD = 'team_lead',
  DEVELOPER = 'developer',
}

export interface IProjectMember {
  userId: Types.ObjectId;
  userRole: ProjectMemberRole;
}

export interface IProject {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  createdBy: Types.ObjectId;
  projectManager: Types.ObjectId;
  members: IProjectMember[];
  deletedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      enum: Object.values(ProjectMemberRole),
      required: true,
    },
  },
  {
    _id: false,
  }
);

export type ProjectDocument = IProject & Document;

const ProjectSchema = new Schema<ProjectDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    status: { type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.ACTIVE },
    progress: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectManager: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: { type: [ProjectMemberSchema], default: [], },
    deletedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ProjectSchema.index({ projectManager: 1, deletedAt: 1 });
ProjectSchema.index({ workspaceId: 1, deletedAt: 1 });

export const Project = model<ProjectDocument>('Project', ProjectSchema);
