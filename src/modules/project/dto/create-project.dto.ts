import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ArrayUnique } from 'class-validator';
import { ProjectStatus } from '../entity/project.entity';

export class CreateProjectDto {
  @IsString({ message: 'Workspace ID must be a string' })
  @IsNotEmpty({ message: 'Workspace ID is required' })
  workspaceId: string;

  @IsString({ message: 'Project name must be a string' })
  @IsNotEmpty({ message: 'Project name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus, { message: 'Status must be a valid project status' })
  @IsOptional()
  status?: ProjectStatus;

  @IsNumber({}, { message: 'Progress must be a number' })
  @IsOptional()
  progress?: number;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @IsOptional()
  endDate?: string;

  @IsArray({ message: 'Members must be an array' })
  @ArrayUnique({ message: 'Members must be unique' })
  @IsOptional()
  members?: string[];
}
