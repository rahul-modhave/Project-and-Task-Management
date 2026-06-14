import { Router } from 'express';
import { container } from '../../../dependency_injection/container';
import { TYPES } from '../../../dependency_injection/types';
import { DashboardController } from '../controller/dashboard.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

const getController = (): DashboardController => {
    return container.get<DashboardController>(TYPES.DashboardController);
};

router.get('/', authMiddleware, (req, res, next) => {
    getController().getDashboard(req, res, next);
});

export default router;
