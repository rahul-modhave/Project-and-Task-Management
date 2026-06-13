import { IBaseRepository } from '../../../repositories/base.repository';
import { ProjectDocument } from '../entity/project.entity';

export interface IProjectRepository extends IBaseRepository<ProjectDocument> {
    findByManager(managerId: string): Promise<ProjectDocument[]>;
    findByIdAndManager(id: string, managerId: string): Promise<ProjectDocument | null>;
}
