import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { TaskType, TaskPriority } from '../entity/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Project ID is required' })
  projectId: string;

  @IsEnum(TaskType)
  @IsOptional()
  taskType?: TaskType;

  @IsString()
  @IsNotEmpty({ message: 'Status ID is required' })
  statusId: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsNumber()
  @IsOptional()
  storyPoints?: number;

  @IsNumber()
  @IsOptional()
  timeEstimateHours?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
