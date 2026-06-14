import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../../../controllers/common/base.controller';
import { TYPES } from '../../../dependency_injection/types';
import { IDashboardService } from '../service/dashboard.service';
import { AppError } from '../../../common/errors/app-error';

@injectable()
export class DashboardController extends BaseController {
    constructor(
        @inject(TYPES.DashboardService) private dashboardService: IDashboardService
    ) {
        super();
    }

    public getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            if (!user) {
                throw AppError.unauthorized('User not authenticated');
            }

            const dashboardData = await this.dashboardService.getDashboard(user.id);
            this.sendSuccess(res, dashboardData, 'Dashboard data retrieved successfully');
        } catch (err) {
            next(err);
        }
    };
}
