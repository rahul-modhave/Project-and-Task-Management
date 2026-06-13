import { injectable } from 'inversify';
import { BaseRepository } from '../../../repositories/base.repository';
import { ProjectMember, ProjectMemberDocument } from '../entity/project-member.entity';
import { IProjectMemberRepository } from '../interface/project-member.repository.interface';

@injectable()
export class ProjectMemberRepository extends BaseRepository<ProjectMemberDocument> implements IProjectMemberRepository {
  constructor() {
    super(ProjectMember);
  }

  async findByProjectId(projectId: string): Promise<ProjectMemberDocument[]> {
    return await this.findAll({ projectId });
  }

  async findByUserId(userId: string): Promise<ProjectMemberDocument[]> {
    return await this.findAll({ userId });
  }
}
