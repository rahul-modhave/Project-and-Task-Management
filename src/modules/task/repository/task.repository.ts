import { injectable } from 'inversify';
import { BaseRepository } from '../../../repositories/base.repository';
import { Task, TaskDocument } from '../entity/task.entity';
import { ITaskRepository } from '../interface/task.repository.interface';

@injectable()
export class TaskRepository extends BaseRepository<TaskDocument> implements ITaskRepository {
  constructor() {
    super(Task);
  }

  async findByProject(projectId: string): Promise<TaskDocument[]> {
    return await this.findAll({ projectId });
  }

  async findByAssignee(assigneeId: string): Promise<TaskDocument[]> {
    return await this.findAll({ assigneeId });
  }

  async getNextTaskKey(projectId: string, projectKey: string): Promise<string> {
    const count = await Task.countDocuments({ projectId });
    return `${projectKey.toUpperCase()}-${count + 1}`;
  }
}
