import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../../../controllers/common/base.controller';
import { TYPES } from '../../../dependency_injection/types';
import { IHealthService } from '../service/health.service';

@injectable()
export class HealthController extends BaseController {
    constructor(
        @inject(TYPES.HealthService) private healthService: IHealthService
    ) {
        super();
    }
    public check = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const healthStatus = await this.healthService.getHealthStatus();
            this.sendSuccess(res, healthStatus, 'Health check completed');
        } catch (err) {
            next(err);
        }
    };
}
