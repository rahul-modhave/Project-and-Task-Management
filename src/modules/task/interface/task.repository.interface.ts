import { IBaseRepository } from '../../../repositories/base.repository';
import { TaskDocument } from '../entity/task.entity';

export interface ITaskRepository extends IBaseRepository<TaskDocument> {
  findByProject(projectId: string): Promise<TaskDocument[]>;
  findByAssignee(assigneeId: string): Promise<TaskDocument[]>;
  getNextTaskKey(projectId: string, projectKey: string): Promise<string>;
}
