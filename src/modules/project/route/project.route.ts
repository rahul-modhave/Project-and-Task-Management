import { Router } from 'express';
import { container } from '../../../dependency_injection/container';
import { TYPES } from '../../../dependency_injection/types';
import { ProjectController } from '../controller/project.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { validationMiddleware } from '../../../middleware/validation.middleware';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ViewProjectDto } from '../dto/view-project.dto';

const router = Router();

const getController = (): ProjectController => {
  return container.get<ProjectController>(TYPES.ProjectController);
};

router.post('/create', authMiddleware, validationMiddleware(CreateProjectDto), (req, res, next) => {
  getController().createProject(req, res, next);
});

router.get('/getAllProjects', authMiddleware, (req, res, next) => {
  getController().getProjects(req, res, next);
});

router.post('/viewProject', authMiddleware, validationMiddleware(ViewProjectDto), (req, res, next) => {
  getController().getProjectDetails(req, res, next);
});

export default router;
