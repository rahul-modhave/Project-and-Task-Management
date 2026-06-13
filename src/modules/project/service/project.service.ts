import { injectable, inject } from 'inversify';
import { Types } from 'mongoose';
import { TYPES } from '../../../dependency_injection/types';
import { IProjectRepository } from '../interface/project.repository.interface';
import { IProjectMemberRepository } from '../interface/project-member.repository.interface';
import { IUserRepository } from '../../auth/interface/user.repository.interface';
import { ILoggerService } from '../../../services/common/logger.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectDocument, ProjectStatus } from '../entity/project.entity';
import { ProjectMemberDocument } from '../entity/project-member.entity';
import { AppError } from '../../../common/errors/app-error';

export interface IProjectService {
  createProject(dto: CreateProjectDto, userId: string): Promise<ProjectDocument>;
  getProjectsByManager(managerId: string): Promise<ProjectDocument[]>;
  getProjectDetails(projectId: string, managerId: string): Promise<{ project: ProjectDocument; manager: { _id: string; email: string; firstName: string; lastName: string } | null; members: ProjectMemberDocument[] }>;
}

@injectable()
export class ProjectService implements IProjectService {
  constructor(
    @inject(TYPES.ProjectRepository) private projectRepository: IProjectRepository,
    @inject(TYPES.ProjectMemberRepository) private projectMemberRepository: IProjectMemberRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {}

  async createProject(dto: CreateProjectDto, userId: string): Promise<ProjectDocument> {
    const project = await this.projectRepository.create({
      workspaceId: new Types.ObjectId(dto.workspaceId),
      name: dto.name,
      description: dto.description ?? undefined,
      status: dto.status ?? ProjectStatus.ACTIVE,
      progress: dto.progress ?? 0,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      createdBy: new Types.ObjectId(userId),
      projectManager: new Types.ObjectId(userId),
      members: dto.members ? dto.members.map((memberId) => new Types.ObjectId(memberId)) : [],
    });

    this.logger.info(`Project created successfully: ${project.name} (${project._id})`);
    return project;
  }

  async getProjectsByManager(managerId: string): Promise<ProjectDocument[]> {
    return await this.projectRepository.findByManager(managerId);
  }

  async getProjectDetails(projectId: string, managerId: string): Promise<{ project: ProjectDocument; manager: { _id: string; email: string; firstName: string; lastName: string } | null; members: ProjectMemberDocument[] }> {
    const project = await this.projectRepository.findByIdAndManager(projectId, managerId);
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    const members = await this.projectMemberRepository.findByProjectId(projectId);
    const managerUser = await this.userRepository.findById(project.projectManager.toString());

    const manager = managerUser
      ? {
          _id: managerUser._id.toString(),
          email: managerUser.email,
          firstName: managerUser.firstName,
          lastName: managerUser.lastName,
        }
      : null;

    return {
      project,
      manager,
      members,
    };
  }
}
