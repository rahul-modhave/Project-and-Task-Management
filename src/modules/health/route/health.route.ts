import { Router } from 'express';
import { container } from '../../../dependency_injection/container';
import { TYPES } from '../../../dependency_injection/types';
import { HealthController } from '../controller/health.controller';

const router = Router();

const getController = (): HealthController => {
    return container.get<HealthController>(TYPES.HealthController);
};

router.get('/', (req, res, next) => {
    getController().check(req, res, next);
});

export default router;
