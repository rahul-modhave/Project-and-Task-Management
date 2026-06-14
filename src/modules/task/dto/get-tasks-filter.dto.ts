import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { TaskType, TaskPriority } from '../entity/task.entity';

export class GetTasksFilterDto {
    @IsString()
    @IsOptional()
    search?: string; // Search in title and description

    @IsString()
    @IsOptional()
    projectId?: string; // Filter by project

    @IsString()
    @IsOptional()
    assigneeId?: string; // Filter by assignee

    @IsArray()
    @IsOptional()
    taskType?: TaskType[]; // Filter by task type (array)

    @IsArray()
    @IsOptional()
    priority?: TaskPriority[]; // Filter by priority (array)

    @IsString()
    @IsOptional()
    statusId?: string; // Filter by status

    @IsDateString()
    @IsOptional()
    dueDateFrom?: string; // Filter tasks with dueDate >= dueDateFrom

    @IsDateString()
    @IsOptional()
    dueDateTo?: string; // Filter tasks with dueDate <= dueDateTo

    @IsDateString()
    @IsOptional()
    createdFrom?: string; // Filter tasks created >= createdFrom

    @IsDateString()
    @IsOptional()
    createdTo?: string; // Filter tasks created <= createdTo

    @IsString()
    @IsOptional()
    reporterId?: string; // Filter by reporter

    @IsOptional()
    sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title'; // Sort field

    @IsOptional()
    sortOrder?: 'asc' | 'desc'; // Sort order (default: desc)

    @IsOptional()
    limit?: number; // Pagination limit (default: 100)

    @IsOptional()
    skip?: number; // Pagination offset (default: 0)
}

