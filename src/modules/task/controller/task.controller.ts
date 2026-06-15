import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../../../controllers/common/base.controller';
import { TYPES } from '../../../dependency_injection/types';
import { ITaskService } from '../service/task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';
import { AppError } from '../../../common/errors/app-error';

@injectable()
export class TaskController extends BaseController {
  constructor(
    @inject(TYPES.TaskService) private taskService: ITaskService
  ) {
    super();
  }

  public createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw AppError.unauthorized('User not authenticated');
      }

      const dto = req.body as CreateTaskDto;
      const task = await this.taskService.createTask(dto, user.id);

      this.sendCreated(res, task, 'Task created successfully');
    } catch (err) {
      next(err);
    }
  };

  public getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw AppError.unauthorized('User not authenticated');
      }

      const tasks = await this.taskService.getAllTasks(user.id);
      this.sendSuccess(res, tasks, 'Tasks for manager projects retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  public getAllTasksWithProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw AppError.unauthorized('User not authenticated');
      }

      const { tasks, projects } = await this.taskService.getTasksWithProjects(user.id);
      res.status(200).json({
        success: true,
        message: 'Tasks for manager projects retrieved successfully',
        projects,
        data: tasks,
      });
    } catch (err) {
      next(err);
    }
  };

  public getTasksByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        throw AppError.badRequest('Project ID is required');
      }

      const tasks = await this.taskService.getTasksByProject(projectId);
      this.sendSuccess(res, tasks, 'Tasks retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  public getTaskDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        throw AppError.badRequest('Task ID is required');
      }

      const task = await this.taskService.getTaskById(taskId);
      if (!task) {
        throw AppError.notFound('Task not found');
      }

      this.sendSuccess(res, task, 'Task details retrieved');
    } catch (err) {
      next(err);
    }
  };

  public getTasksFiltered = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.body as GetTasksFilterDto;
      const tasks = await this.taskService.getTasksWithFilters(filters);
      this.sendSuccess(res, tasks, 'Tasks retrieved successfully with filters');
    } catch (err) {
      next(err);
    }
  };
}

