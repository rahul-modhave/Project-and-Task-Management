import { Response } from 'express';
import { ApiResponse, IPaginationMeta } from '../../common/response/api-response';
import { injectable } from 'inversify';

@injectable()
export abstract class BaseController {
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: Record<string, any>
  ): Response {
    return res.status(statusCode).json(ApiResponse.success(data, message, meta));
  }

  protected sendCreated<T>(
    res: Response,
    data: T,
    message = 'Created successfully'
  ): Response {
    return this.sendSuccess(res, data, message, 201);
  }

  protected sendPaginated<T>(
    res: Response,
    data: T[],
    pagination: IPaginationMeta,
    message = 'Success'
  ): Response {
    return res.status(200).json(ApiResponse.paginated(data, pagination, message));
  }
}
