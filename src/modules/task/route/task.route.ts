import { Router } from 'express';
import { container } from '../../../dependency_injection/container';
import { TYPES } from '../../../dependency_injection/types';
import { TaskController } from '../controller/task.controller';
import { validationMiddleware } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';

const router = Router();

const getController = (): TaskController => {
  return container.get<TaskController>(TYPES.TaskController);
};

router.post('/', authMiddleware, validationMiddleware(CreateTaskDto), (req, res, next) => {
  getController().createTask(req, res, next);
});

router.post('/getTasks', authMiddleware, validationMiddleware(GetTasksFilterDto), (req, res, next) => {
  getController().getTasksFiltered(req, res, next);
});

router.get('/getTasks', authMiddleware, (req, res, next) => {
  getController().getAllTasksWithProjects(req, res, next);
});

router.get('/', authMiddleware, (req, res, next) => {
  getController().getAllTasks(req, res, next);
});

router.get('/project/:projectId', authMiddleware, (req, res, next) => {
  getController().getTasksByProject(req, res, next);
});

router.get('/:taskId', authMiddleware, (req, res, next) => {
  getController().getTaskDetails(req, res, next);
});

export default router;
