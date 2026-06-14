import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsDateString, IsObject } from 'class-validator';
import { TaskType, TaskPriority } from '../entity/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Project ID is required' })
  projectId: string;

  @IsEnum(TaskType, { message: 'Invalid task type' })
  taskType: TaskType;

  @IsString()
  @IsNotEmpty({ message: 'Status ID is required' })
  statusId: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsNotEmpty({ message: 'Assignee ID is required' })
  assigneeId: string;

  @IsString()
  @IsOptional()
  parentTaskId?: string;

  @IsNumber()
  @IsOptional()
  storyPoints?: number;

  @IsNumber()
  @IsOptional()
  timeEstimateHours?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}