import { injectable, inject } from 'inversify';
import { TYPES } from '../../../dependency_injection/types';
import { ITaskRepository } from '../interface/task.repository.interface';
import { ISocketService } from '../../../services/common/socket.service';
import { ILoggerService } from '../../../services/common/logger.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';
import { TaskDocument, TaskPriority } from '../entity/task.entity';
import { IProjectService } from '../../project/service/project.service';

export interface ITaskService {
  createTask(dto: CreateTaskDto, reporterId: string): Promise<TaskDocument>;
  getAllTasks(managerId: string): Promise<TaskDocument[]>;
  getTasksByProject(projectId: string): Promise<TaskDocument[]>;
  getTaskById(id: string): Promise<TaskDocument | null>;
  getTasksWithFilters(filters: GetTasksFilterDto): Promise<TaskDocument[]>;
}

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TYPES.TaskRepository) private taskRepository: ITaskRepository,
    @inject(TYPES.ProjectService) private projectService: IProjectService,
    @inject(TYPES.SocketService) private socketService: ISocketService,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) { }

  async createTask(dto: CreateTaskDto, reporterId: string): Promise<TaskDocument> {
    const projectKey = 'CF';
    const key = await this.taskRepository.getNextTaskKey(dto.projectId, projectKey);

    const position = Date.now();

    const savedTask = await this.taskRepository.create({
      projectId: dto.projectId,
      title: dto.title,
      description: dto.description ?? undefined,
      key,
      taskType: dto.taskType,
      statusId: dto.statusId,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      assigneeId: dto.assigneeId,
      reporterId,
      parentTaskId: dto.parentTaskId ?? undefined,
      storyPoints: dto.storyPoints ?? undefined,
      timeEstimateHours: dto.timeEstimateHours ?? undefined,
      timeSpentHours: 0,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      position,
      metadata: dto.metadata ?? {},
    });

    this.logger.info(`Task created successfully: ${savedTask.key} - ${savedTask.title}`);

    this.socketService.emitToRoom(`project:${savedTask.projectId}`, 'task:created', {
      task: savedTask,
    });

    return savedTask;
  }

  async getAllTasks(managerId: string): Promise<TaskDocument[]> {
    const projects = await this.projectService.getProjectsByManager(managerId);
    const projectIds = projects.map((project) => project._id.toString());

    if (projectIds.length === 0) {
      return [];
    }

    return await this.taskRepository.findByProjectIds(projectIds);
  }

  async getTasksByProject(projectId: string): Promise<TaskDocument[]> {
    return await this.taskRepository.findByProject(projectId);
  }

  async getTaskById(id: string): Promise<TaskDocument | null> {
    return await this.taskRepository.findById(id);
  }

  async getTasksWithFilters(filters: GetTasksFilterDto): Promise<TaskDocument[]> {
    this.logger.info('Fetching tasks with filters', { filters });
    const tasks = await this.taskRepository.findWithFilters(filters);
    return tasks;
  }
}

