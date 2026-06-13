import { IBaseRepository } from '../../../repositories/base.repository';
import { ProjectMemberDocument } from '../entity/project-member.entity';

export interface IProjectMemberRepository extends IBaseRepository<ProjectMemberDocument> {
  findByProjectId(projectId: string): Promise<ProjectMemberDocument[]>;
  findByUserId(userId: string): Promise<ProjectMemberDocument[]>;
}
