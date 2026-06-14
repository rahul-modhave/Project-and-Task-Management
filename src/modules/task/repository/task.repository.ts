import { injectable } from 'inversify';
import { BaseRepository } from '../../../repositories/base.repository';
import { Task, TaskDocument } from '../entity/task.entity';
import { ITaskRepository } from '../interface/task.repository.interface';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';

@injectable()
export class TaskRepository extends BaseRepository<TaskDocument> implements ITaskRepository {
  constructor() {
    super(Task);
  }

  async findByProject(projectId: string): Promise<TaskDocument[]> {
    return await this.findAll({ projectId, deletedAt: null });
  }

  async findByProjectIds(projectIds: string[]): Promise<TaskDocument[]> {
    return await this.findAll({ projectId: { $in: projectIds }, deletedAt: null });
  }

  async findByAssignee(assigneeId: string): Promise<TaskDocument[]> {
    return await this.findAll({ assigneeId, deletedAt: null });
  }

  async getNextTaskKey(projectId: string, projectKey: string): Promise<string> {
    const count = await Task.countDocuments({ projectId, deletedAt: null });
    return `${projectKey.toUpperCase()}-${count + 1}`;
  }

  async findWithFilters(filters: GetTasksFilterDto): Promise<TaskDocument[]> {
    const query: any = { deletedAt: null };

    // Text search in title and description
    if (filters.search && filters.search.trim()) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Filter by project
    if (filters.projectId) {
      query.projectId = filters.projectId;
    }

    // Filter by assignee
    if (filters.assigneeId) {
      query.assigneeId = filters.assigneeId;
    }

    // Filter by task type
    if (filters.taskType && filters.taskType.length > 0) {
      query.taskType = { $in: filters.taskType };
    }

    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      query.priority = { $in: filters.priority };
    }

    // Filter by status
    if (filters.statusId) {
      query.statusId = filters.statusId;
    }

    // Filter by reporter
    if (filters.reporterId) {
      query.reporterId = filters.reporterId;
    }

    // Filter by dueDate range
    if (filters.dueDateFrom || filters.dueDateTo) {
      query.dueDate = {};
      if (filters.dueDateFrom) {
        query.dueDate.$gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        query.dueDate.$lte = new Date(filters.dueDateTo);
      }
    }

    // Filter by createdAt range
    if (filters.createdFrom || filters.createdTo) {
      query.createdAt = {};
      if (filters.createdFrom) {
        query.createdAt.$gte = new Date(filters.createdFrom);
      }
      if (filters.createdTo) {
        query.createdAt.$lte = new Date(filters.createdTo);
      }
    }

    // Build sort object
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    // Pagination
    const limit = Math.min(filters.limit || 100, 1000); // Max 1000 tasks per query
    const skip = filters.skip || 0;

    const tasks = await Task.find(query)
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .exec();

    return tasks as TaskDocument[];
  }
}
