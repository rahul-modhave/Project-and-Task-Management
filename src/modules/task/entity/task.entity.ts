import { Schema, model, Document, Types } from 'mongoose';

export enum TaskType {
  STORY = 'story',
  TASK = 'task',
  SUBTASK = 'subtask',
  BUG = 'bug',
  IMPROVEMENT = 'improvement',
}

export enum TaskPriority {
  LOWEST = 'lowest',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  HIGHEST = 'highest',
}

export interface ITask {
  _id: Types.ObjectId;
  projectId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  taskType: TaskType;
  statusId: string;
  priority: TaskPriority;
  assigneeId?: string;
  reporterId: string;
  storyPoints?: number;
  timeEstimateHours?: number;
  timeSpentHours: number;
  dueDate?: Date;
  position: number;
  metadata: Record<string, unknown>;
  deletedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskDocument = ITask & Document;

const TaskSchema = new Schema<TaskDocument>(
  {
    projectId: { type: String, required: true, index: true },
    parentTaskId: { type: String, default: null },
    title: { type: String, required: true },
    description: { type: String, default: null },
    taskType: { type: String, enum: Object.values(TaskType), default: TaskType.TASK },
    statusId: { type: String, required: true },
    priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM },
    assigneeId: { type: String, default: null },
    reporterId: { type: String, required: true },
    storyPoints: { type: Number, default: null },
    timeEstimateHours: { type: Number, default: null },
    timeSpentHours: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
    position: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    deletedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for common query patterns
TaskSchema.index({ projectId: 1, deletedAt: 1 });
TaskSchema.index({ assigneeId: 1, deletedAt: 1 });

export const Task = model<TaskDocument>('Task', TaskSchema);
