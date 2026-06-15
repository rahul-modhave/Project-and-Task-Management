import { IBaseRepository } from '../../../repositories/base.repository';
import { TaskDocument } from '../entity/task.entity';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';

export interface ITaskRepository extends IBaseRepository<TaskDocument> {
  findByProject(projectId: string): Promise<TaskDocument[]>;
  findByProjectIds(projectIds: string[]): Promise<TaskDocument[]>;
  findByAssignee(assigneeId: string): Promise<TaskDocument[]>;
  findWithFilters(filters: GetTasksFilterDto): Promise<TaskDocument[]>;
}
