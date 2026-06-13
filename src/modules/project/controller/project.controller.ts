import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../../../controllers/common/base.controller';
import { TYPES } from '../../../dependency_injection/types';
import { IProjectService } from '../service/project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ViewProjectDto } from '../dto/view-project.dto';
import { AppError } from '../../../common/errors/app-error';

@injectable()
export class ProjectController extends BaseController {
    constructor(
        @inject(TYPES.ProjectService) private projectService: IProjectService
    ) {
        super();
    }

    public createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            if (!user) {
                throw AppError.unauthorized('User not authenticated');
            }

            const dto = req.body as CreateProjectDto;
            const project = await this.projectService.createProject(dto, user._id.toString());

            this.sendCreated(res, project, 'Project created successfully');
        } catch (err) {
            next(err);
        }
    };

    public getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            if (!user) {
                throw AppError.unauthorized('User not authenticated');
            }

            const projects = await this.projectService.getProjectsByManager(user._id.toString());
            this.sendSuccess(res, projects, 'Projects retrieved successfully');
        } catch (err) {
            next(err);
        }
    };

    public getProjectDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            if (!user) {
                throw AppError.unauthorized('User not authenticated');
            }

            const dto = req.body as ViewProjectDto;
            const { projectId } = dto;
            if (!projectId) {
                throw AppError.badRequest('Project ID is required');
            }

            const details = await this.projectService.getProjectDetails(projectId, user._id.toString());
            this.sendSuccess(res, details, 'Project details retrieved successfully');
        } catch (err) {
            next(err);
        }
    };
}
