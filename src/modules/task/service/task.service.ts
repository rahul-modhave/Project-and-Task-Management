import { injectable, inject } from 'inversify';
import { TYPES } from '../../../dependency_injection/types';
import { ITaskRepository } from '../interface/task.repository.interface';
import { ISocketService } from '../../../services/common/socket.service';
import { ILoggerService } from '../../../services/common/logger.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskDocument } from '../entity/task.entity';

export interface ITaskService {
  createTask(dto: CreateTaskDto, reporterId: string): Promise<TaskDocument>;
  getTasksByProject(projectId: string): Promise<TaskDocument[]>;
  getTaskById(id: string): Promise<TaskDocument | null>;
}

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TYPES.TaskRepository) private taskRepository: ITaskRepository,
    @inject(TYPES.SocketService) private socketService: ISocketService,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {}

  async createTask(dto: CreateTaskDto, reporterId: string): Promise<TaskDocument> {
    // Generate next key sequence (normally we'd query project details, using mock "CF" prefix here)
    const projectKey = 'CF';
    const key = await this.taskRepository.getNextTaskKey(dto.projectId, projectKey);

    // Get current max position to place new task at the end (mocking with simple date position)
    const position = Date.now();

    const savedTask = await this.taskRepository.create({
      ...dto,
      key,
      reporterId,
      position,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });

    this.logger.info(`Task created successfully: ${savedTask.key} - ${savedTask.title}`);

    // Broadcast update via Socket.IO to Project Room
    this.socketService.emitToRoom(`project:${savedTask.projectId}`, 'task:created', {
      task: savedTask,
    });

    return savedTask;
  }

  async getTasksByProject(projectId: string): Promise<TaskDocument[]> {
    return await this.taskRepository.findByProject(projectId);
  }

  async getTaskById(id: string): Promise<TaskDocument | null> {
    return await this.taskRepository.findById(id);
  }
}
