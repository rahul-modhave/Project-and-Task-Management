import { injectable } from 'inversify';
import { BaseRepository } from '../../../repositories/base.repository';
import { Project, ProjectDocument } from '../entity/project.entity';
import { IProjectRepository } from '../interface/project.repository.interface';

@injectable()
export class ProjectRepository extends BaseRepository<ProjectDocument> implements IProjectRepository {
  constructor() {
    super(Project);
  }

  async findByManager(managerId: string): Promise<ProjectDocument[]> {
    return await this.findAll({ projectManager: managerId, deletedAt: null });
  }

  async findByIdAndManager(id: string, managerId: string): Promise<ProjectDocument | null> {
    return await this.findOne({ _id: id, projectManager: managerId, deletedAt: null });
  }
}
